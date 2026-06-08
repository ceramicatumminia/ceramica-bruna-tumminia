'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './ImageEditor.module.css'

type Props = {
  file: File
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Filters = {
  brightness: number   // 50-150, default 100
  contrast: number     // 50-150, default 100
  saturation: number   // 0-200,  default 100
  sharpness: number    // 0-10,   default 0
  whiteBalance: number // -50-50, default 0 (warm/cool)
}

type EdgeBlur = {
  enabled: boolean
  side: 'radiale' | 'sinistra' | 'destra' | 'alto' | 'basso'
  ampiezza: number  // 2-40%
  intensita: number // 0-100
}

type Brush = {
  mode: 'sfuma' | 'sfoca' | 'gomma'
  size: number      // 10-150px
  intensita: number // 1-100
  active: boolean
}

type MaskShape = 'nessuna' | 'ellisse' | 'cerchio'
type MaskEdge = { shape: MaskShape; feather: number } // feather 0-80

type Tab = 'crop' | 'effects' | 'brush' | 'mask'

const defaultFilters: Filters = { brightness: 100, contrast: 100, saturation: 100, sharpness: 0, whiteBalance: 0 }
const defaultEdge: EdgeBlur = { enabled: false, side: 'radiale', ampiezza: 10, intensita: 50 }
const defaultBrush: Brush = { mode: 'sfuma', size: 40, intensita: 50, active: false }
const defaultMask: MaskEdge = { shape: 'nessuna', feather: 30 }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applySharpness(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  if (amount === 0) return
  const imageData = ctx.getImageData(0, 0, w, h)
  const d = imageData.data
  const k = amount * 0.3
  const kernel = [-k, -k, -k, -k, 1 + 8 * k, -k, -k, -k, -k]
  const tmp = new Uint8ClampedArray(d)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        let v = 0
        for (let ky = -1; ky <= 1; ky++)
          for (let kx = -1; kx <= 1; kx++)
            v += tmp[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)]
        d[i + c] = Math.max(0, Math.min(255, v))
      }
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyWhiteBalance(ctx: CanvasRenderingContext2D, w: number, h: number, wb: number) {
  if (wb === 0) return
  const imageData = ctx.getImageData(0, 0, w, h)
  const d = imageData.data
  const warm = wb > 0 ? wb / 50 : 0
  const cool = wb < 0 ? -wb / 50 : 0
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.min(255, d[i]     + warm * 30 - cool * 10)
    d[i + 1] = Math.min(255, d[i + 1] + warm * 10)
    d[i + 2] = Math.min(255, d[i + 2] - warm * 10 + cool * 30)
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyEdgeFade(ctx: CanvasRenderingContext2D, w: number, h: number, edge: EdgeBlur) {
  if (!edge.enabled || edge.intensita === 0) return
  const fadeStrength = edge.intensita / 100
  const fadeSize = (edge.ampiezza / 100) * Math.min(w, h)
  const alphaCanvas = document.createElement('canvas')
  alphaCanvas.width = w; alphaCanvas.height = h
  const aCtx = alphaCanvas.getContext('2d')!
  let grad: CanvasGradient
  if (edge.side === 'radiale') {
    const innerR = Math.min(w, h) * ((100 - edge.ampiezza * 2) / 100) * 0.5
    const outerR = Math.max(w, h) * 0.72
    grad = aCtx.createRadialGradient(w/2, h/2, Math.max(0, innerR), w/2, h/2, outerR)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, `rgba(0,0,0,${fadeStrength})`)
  } else if (edge.side === 'sinistra') {
    grad = aCtx.createLinearGradient(0, 0, fadeSize, 0)
    grad.addColorStop(0, `rgba(0,0,0,${fadeStrength})`); grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else if (edge.side === 'destra') {
    grad = aCtx.createLinearGradient(w - fadeSize, 0, w, 0)
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, `rgba(0,0,0,${fadeStrength})`)
  } else if (edge.side === 'alto') {
    grad = aCtx.createLinearGradient(0, 0, 0, fadeSize)
    grad.addColorStop(0, `rgba(0,0,0,${fadeStrength})`); grad.addColorStop(1, 'rgba(0,0,0,0)')
  } else {
    grad = aCtx.createLinearGradient(0, h - fadeSize, 0, h)
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, `rgba(0,0,0,${fadeStrength})`)
  }
  aCtx.fillStyle = grad
  aCtx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'destination-out'
  ctx.drawImage(alphaCanvas, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}

function applyMask(ctx: CanvasRenderingContext2D, w: number, h: number, mask: MaskEdge) {
  if (mask.shape === 'nessuna') return
  const maskC = document.createElement('canvas')
  maskC.width = w; maskC.height = h
  const mCtx = maskC.getContext('2d')!
  mCtx.fillStyle = 'black'
  mCtx.fillRect(0, 0, w, h)
  const feather = (mask.feather / 100) * Math.min(w, h) * 0.5
  const cx = w / 2, cy = h / 2
  const rx = mask.shape === 'cerchio' ? Math.min(w, h) / 2 - feather * 0.5 : w / 2 - feather * 0.5
  const ry = mask.shape === 'cerchio' ? Math.min(w, h) / 2 - feather * 0.5 : h / 2 - feather * 0.5
  // Draw white ellipse (keep area)
  mCtx.save()
  if (feather > 0) {
    for (let i = 0; i <= 20; i++) {
      const t = i / 20
      const alpha = t
      const erx = rx + feather * (1 - t)
      const ery = ry + feather * (1 - t)
      mCtx.globalAlpha = alpha / 20
      mCtx.fillStyle = 'white'
      mCtx.beginPath()
      mCtx.ellipse(cx, cy, Math.max(1, erx), Math.max(1, ery), 0, 0, Math.PI * 2)
      mCtx.fill()
    }
  }
  mCtx.globalAlpha = 1
  mCtx.fillStyle = 'white'
  mCtx.beginPath()
  mCtx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2)
  mCtx.fill()
  mCtx.restore()
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(maskC, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImageEditor({ file, onConfirm, onCancel }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const previewRef  = useRef<HTMLCanvasElement>(null)
  const brushRef    = useRef<HTMLCanvasElement>(null)  // brush mask canvas
  const imgRef      = useRef<HTMLImageElement | null>(null)
  const brushMaskRef = useRef<HTMLCanvasElement | null>(null) // persistent brush mask

  const [filters, setFilters]   = useState<Filters>(defaultFilters)
  const [edge, setEdge]         = useState<EdgeBlur>(defaultEdge)
  const [brush, setBrush]       = useState<Brush>(defaultBrush)
  const [mask, setMask]         = useState<MaskEdge>(defaultMask)
  const [tab, setTab]           = useState<Tab>('crop')
  const [imgSize, setImgSize]   = useState({ w: 0, h: 0, scale: 1 })
  const [cropBox, setCropBox]   = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragMode, setDragMode] = useState<'move'|'nw'|'ne'|'sw'|'se'|'new'>('new')
  const [cursor, setCursor]     = useState('crosshair')
  const [isPainting, setIsPainting] = useState(false)
  const [outputSize, setOutputSize] = useState(100) // percentage 10-100

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      imgRef.current = img
      const maxW = 680, maxH = 460
      const scale = Math.min(maxW / img.width, maxH / img.height, 1)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      setImgSize({ w, h, scale })
      setCropBox({ x: 0, y: 0, w, h })
      // Init brush mask (transparent = no effect)
      const bm = document.createElement('canvas')
      bm.width = w; bm.height = h
      brushMaskRef.current = bm
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // ─── Draw preview ──────────────────────────────────────────────────────────
  const drawPreview = useCallback(() => {
    const img = imgRef.current
    const canvas = previewRef.current
    const bm = brushMaskRef.current
    if (!img || !canvas || cropBox.w < 1 || cropBox.h < 1) return
    const ctx = canvas.getContext('2d')!
    const { scale } = imgSize
    canvas.width = cropBox.w; canvas.height = cropBox.h

    // 1. Draw base with CSS filters
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`
    ctx.drawImage(img, cropBox.x/scale, cropBox.y/scale, cropBox.w/scale, cropBox.h/scale, 0, 0, cropBox.w, cropBox.h)
    ctx.filter = 'none'

    // 2. Sharpness (convolution)
    applySharpness(ctx, cropBox.w, cropBox.h, filters.sharpness)

    // 3. White balance
    applyWhiteBalance(ctx, cropBox.w, cropBox.h, filters.whiteBalance)

    // 4. Edge fade (transparency)
    applyEdgeFade(ctx, cropBox.w, cropBox.h, edge)

    // 5. Brush mask
    if (bm) {
      const bCtx = bm.getContext('2d')!
      const maskData = bCtx.getImageData(0, 0, cropBox.w, cropBox.h)
      const imgData  = ctx.getImageData(0, 0, cropBox.w, cropBox.h)
      for (let i = 0; i < maskData.data.length; i += 4) {
        const strength = maskData.data[i + 3] / 255 // alpha = effect strength
        if (strength === 0) continue
        const mode = maskData.data[i] > 128 ? 'sfuma' : maskData.data[i + 1] > 128 ? 'sfoca' : 'gomma'
        if (mode === 'gomma') {
          imgData.data[i + 3] = Math.max(0, imgData.data[i + 3] - strength * 255)
        } else if (mode === 'sfuma') {
          imgData.data[i + 3] = Math.max(0, imgData.data[i + 3] - strength * 200)
        }
        // sfoca handled separately below
      }
      ctx.putImageData(imgData, 0, 0)
    }

    // 6. Mask shape
    applyMask(ctx, cropBox.w, cropBox.h, mask)
  }, [filters, edge, mask, cropBox, imgSize])

  useEffect(() => {
    if (imgRef.current && imgSize.w > 0) drawPreview()
  }, [filters, edge, mask, cropBox, imgSize, drawPreview])

  // ─── Draw crop overlay ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current || imgSize.w === 0 || tab !== 'crop') return
    const ctx = canvas.getContext('2d')!
    canvas.width = imgSize.w; canvas.height = imgSize.h
    ctx.drawImage(imgRef.current, 0, 0, imgSize.w, imgSize.h)
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, imgSize.w, imgSize.h)
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)
    ctx.drawImage(imgRef.current, cropBox.x/imgSize.scale, cropBox.y/imgSize.scale, cropBox.w/imgSize.scale, cropBox.h/imgSize.scale, cropBox.x, cropBox.y, cropBox.w, cropBox.h)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1
    ctx.strokeRect(cropBox.x+.5, cropBox.y+.5, cropBox.w-1, cropBox.h-1)
    // thirds
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.5
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(cropBox.x+(cropBox.w/3)*i, cropBox.y); ctx.lineTo(cropBox.x+(cropBox.w/3)*i, cropBox.y+cropBox.h); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cropBox.x, cropBox.y+(cropBox.h/3)*i); ctx.lineTo(cropBox.x+cropBox.w, cropBox.y+(cropBox.h/3)*i); ctx.stroke()
    }
    // L-handles
    const hs = 16, hw = 3
    const corners = [{x:cropBox.x,y:cropBox.y,dx:1,dy:1},{x:cropBox.x+cropBox.w,y:cropBox.y,dx:-1,dy:1},{x:cropBox.x,y:cropBox.y+cropBox.h,dx:1,dy:-1},{x:cropBox.x+cropBox.w,y:cropBox.y+cropBox.h,dx:-1,dy:-1}]
    ctx.strokeStyle = '#e8945a'; ctx.lineWidth = hw
    corners.forEach(({x,y,dx,dy}) => {
      ctx.beginPath(); ctx.moveTo(x+dx*hs,y); ctx.lineTo(x,y); ctx.lineTo(x,y+dy*hs); ctx.stroke()
    })
  }, [cropBox, imgSize, tab])

  // ─── Draw brush canvas ─────────────────────────────────────────────────────
  useEffect(() => {
    const bc = brushRef.current
    if (!bc || !imgRef.current || imgSize.w === 0 || tab !== 'brush') return
    bc.width = imgSize.w; bc.height = imgSize.h
    const ctx = bc.getContext('2d')!
    ctx.drawImage(imgRef.current, 0, 0, imgSize.w, imgSize.h)
    // Show brush mask overlay
    const bm = brushMaskRef.current
    if (bm) {
      ctx.globalAlpha = 0.4
      ctx.drawImage(bm, 0, 0)
      ctx.globalAlpha = 1
    }
  }, [imgSize, tab])

  // ─── Crop interactions ─────────────────────────────────────────────────────
  const HANDLE = 16
  const getHandle = (mx: number, my: number) => {
    const {x,y,w,h} = cropBox
    const n = (ax:number,ay:number) => Math.abs(mx-ax)<HANDLE && Math.abs(my-ay)<HANDLE
    if (n(x,y)) return 'nw'; if (n(x+w,y)) return 'ne'
    if (n(x,y+h)) return 'sw'; if (n(x+w,y+h)) return 'se'
    return null
  }
  const inCrop = (mx:number,my:number) => { const {x,y,w,h}=cropBox; return mx>=x&&mx<=x+w&&my>=y&&my<=y+h }
  const clamp = (v:number,a:number,b:number) => Math.max(a,Math.min(b,v))

  const onCropDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current!.getBoundingClientRect()
    const mx=e.clientX-r.left, my=e.clientY-r.top
    const h = getHandle(mx,my)
    if (h) setDragMode(h as any)
    else if (inCrop(mx,my)) setDragMode('move')
    else { setDragMode('new'); setCropBox({x:mx,y:my,w:0,h:0}) }
    setDragStart({x:mx,y:my}); setDragging(true)
  }
  const onCropMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return
    const r = canvasRef.current!.getBoundingClientRect()
    const mx=clamp(e.clientX-r.left,0,imgSize.w), my=clamp(e.clientY-r.top,0,imgSize.h)
    const dx=mx-dragStart.x, dy=my-dragStart.y
    if (dragMode==='new') {
      setCropBox({x:clamp(dx>=0?dragStart.x:mx,0,imgSize.w),y:clamp(dy>=0?dragStart.y:my,0,imgSize.h),w:Math.abs(dx),h:Math.abs(dy)})
    } else if (dragMode==='move') {
      setCropBox(p=>({...p,x:clamp(p.x+dx,0,imgSize.w-p.w),y:clamp(p.y+dy,0,imgSize.h-p.h)}))
      setDragStart({x:mx,y:my})
    } else {
      setCropBox(p => {
        let {x,y,w,h}=p
        if (dragMode==='se'){w=clamp(mx-x,20,imgSize.w-x);h=clamp(my-y,20,imgSize.h-y)}
        if (dragMode==='sw'){const nx=clamp(mx,0,x+w-20);w=x+w-nx;x=nx;h=clamp(my-y,20,imgSize.h-y)}
        if (dragMode==='ne'){w=clamp(mx-x,20,imgSize.w-x);const ny=clamp(my,0,y+h-20);h=y+h-ny;y=ny}
        if (dragMode==='nw'){const nx=clamp(mx,0,x+w-20);w=x+w-nx;x=nx;const ny=clamp(my,0,y+h-20);h=y+h-ny;y=ny}
        return {x,y,w,h}
      })
    }
  }
  const getCropCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging) return dragMode==='move'?'grabbing':'crosshair'
    const r=canvasRef.current!.getBoundingClientRect()
    const mx=e.clientX-r.left,my=e.clientY-r.top
    const h=getHandle(mx,my)
    if (h==='nw'||h==='se') return 'nwse-resize'
    if (h==='ne'||h==='sw') return 'nesw-resize'
    if (inCrop(mx,my)) return 'grab'
    return 'crosshair'
  }

  // ─── Brush interactions ────────────────────────────────────────────────────
  const paintAt = useCallback((mx: number, my: number) => {
    const bm = brushMaskRef.current
    const bc = brushRef.current
    if (!bm || !bc || !imgRef.current) return
    const bmCtx = bm.getContext('2d')!
    const bcCtx = bc.getContext('2d')!
    const r = brush.size / 2
    const alpha = brush.intensita / 100

    // Color encodes mode: R=sfuma, G=sfoca, B=gomma
    let color = 'rgba(255,0,0,'
    if (brush.mode === 'sfoca') color = 'rgba(0,255,0,'
    if (brush.mode === 'gomma') color = 'rgba(0,0,255,'

    // Soft brush using radial gradient
    const grad = bmCtx.createRadialGradient(mx,my,0,mx,my,r)
    grad.addColorStop(0, color + alpha + ')')
    grad.addColorStop(1, color + '0)')
    bmCtx.globalCompositeOperation = 'source-over'
    bmCtx.fillStyle = grad
    bmCtx.beginPath(); bmCtx.arc(mx,my,r,0,Math.PI*2); bmCtx.fill()

    // Redraw brush canvas
    bcCtx.clearRect(0,0,imgSize.w,imgSize.h)
    bcCtx.drawImage(imgRef.current,0,0,imgSize.w,imgSize.h)
    bcCtx.globalAlpha = 0.5
    bcCtx.drawImage(bm,0,0)
    bcCtx.globalAlpha = 1
  }, [brush, imgSize])

  const onBrushDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = brushRef.current!.getBoundingClientRect()
    setIsPainting(true)
    paintAt(e.clientX-r.left, e.clientY-r.top)
    drawPreview()
  }
  const onBrushMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPainting) return
    const r = brushRef.current!.getBoundingClientRect()
    paintAt(e.clientX-r.left, e.clientY-r.top)
    drawPreview()
  }
  const onBrushUp = () => { setIsPainting(false); drawPreview() }

  const clearBrush = () => {
    const bm = brushMaskRef.current
    if (!bm) return
    bm.getContext('2d')!.clearRect(0,0,bm.width,bm.height)
    drawPreview()
    // Refresh brush canvas
    const bc = brushRef.current
    if (bc && imgRef.current) {
      const ctx = bc.getContext('2d')!
      ctx.clearRect(0,0,imgSize.w,imgSize.h)
      ctx.drawImage(imgRef.current,0,0,imgSize.w,imgSize.h)
    }
  }

  const handleConfirm = () => {
    const canvas = previewRef.current
    if (!canvas) return
    const scale = outputSize / 100
    const finalW = Math.round(canvas.width * scale)
    const finalH = Math.round(canvas.height * scale)
    const out = document.createElement('canvas')
    out.width = finalW; out.height = finalH
    const ctx = out.getContext('2d')!
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, finalW, finalH)
    out.toBlob(blob => { if (blob) onConfirm(blob) }, 'image/jpeg', 0.92)
  }

  const resetAll = () => {
    setFilters(defaultFilters); setEdge(defaultEdge); setMask(defaultMask)
    clearBrush()
  }

  // ─── UI ────────────────────────────────────────────────────────────────────
  const Slider = ({ label, value, min, max, onChange, unit='', color=false }:
    { label:string; value:number; min:number; max:number; onChange:(v:number)=>void; unit?:string; color?:boolean }) => (
    <div className={styles.filterRow}>
      <div className={styles.filterLabel}>
        <span>{label}</span>
        <span className={styles.filterVal}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className={styles.slider} />
    </div>
  )

  const sides = ['radiale','sinistra','destra','alto','basso'] as const

  return (
    <div className={styles.overlay}>
      <div className={styles.editor}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.title}>Editor immagine</span>
          <div className={styles.tabs}>
            {(['crop','effects','brush','mask'] as Tab[]).map(t => (
              <button key={t} className={`${styles.tab} ${tab===t?styles.activeTab:''}`} onClick={() => setTab(t)}>
                {t==='crop'?'Ritaglia':t==='effects'?'Effetti':t==='brush'?'Pennello':'Maschera'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.body}>
          {/* ── Left panel ── */}
          <div className={styles.canvasWrap}>

            {/* CROP */}
            {tab==='crop' && <>
              <canvas ref={canvasRef} className={styles.mainCanvas}
                onMouseDown={onCropDown}
                onMouseMove={e => { onCropMove(e); setCursor(getCropCursor(e)) }}
                onMouseUp={() => setDragging(false)}
                onMouseLeave={() => setDragging(false)}
                style={{cursor}} />
              <div className={styles.cropActions}>
                <button className={styles.resetBtn} onClick={() => setCropBox({x:0,y:0,w:imgSize.w,h:imgSize.h})}>Reset crop</button>
                <span className={styles.hint}>Trascina gli angoli arancioni · Al centro per spostare</span>
              </div>
            </>}

            {/* EFFECTS — shows preview */}
            {tab==='effects' && <>
              <canvas ref={previewRef} className={styles.mainCanvas} style={{background:'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 16px 16px'}} />
              <span className={styles.hint}>Anteprima effetti in tempo reale</span>
            </>}

            {/* BRUSH */}
            {tab==='brush' && <>
              <canvas ref={brushRef} className={styles.mainCanvas}
                style={{cursor:`url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${brush.size}' height='${brush.size}'><circle cx='${brush.size/2}' cy='${brush.size/2}' r='${brush.size/2-1}' stroke='%23e8945a' stroke-width='1.5' fill='none'/></svg>") ${brush.size/2} ${brush.size/2}, crosshair`}}
                onMouseDown={onBrushDown}
                onMouseMove={onBrushMove}
                onMouseUp={onBrushUp}
                onMouseLeave={onBrushUp} />
              <div className={styles.cropActions}>
                <button className={styles.resetBtn} onClick={clearBrush}>Cancella pennellate</button>
                <span className={styles.hint}>Dipingi sull&apos;immagine per applicare l&apos;effetto</span>
              </div>
            </>}

            {/* MASK — shows preview */}
            {tab==='mask' && <>
              <canvas ref={previewRef} className={styles.mainCanvas} style={{background:'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 16px 16px'}} />
              <span className={styles.hint}>La trasparenza mostra lo sfondo del sito</span>
            </>}
          </div>

          {/* ── Right panel ── */}
          <div className={styles.previewWrap}>

            {/* CROP: mini preview */}
            {tab==='crop' && <>
              <div className={styles.previewLabel}>Anteprima</div>
              <div className={styles.previewBox} style={{padding:'8px'}}>
                <canvas ref={previewRef} className={styles.previewCanvas}
                  style={{
                    maxWidth: `${outputSize}%`,
                    maxHeight: `${outputSize}%`,
                    transition: 'max-width 0.15s, max-height 0.15s'
                  }} />
              </div>
              {cropBox.w>0&&cropBox.h>0&&<div className={styles.previewHint}>{Math.round(cropBox.w/imgSize.scale)}×{Math.round(cropBox.h/imgSize.scale)} px originale</div>}
              <div className={styles.divider}/>
              <div className={styles.groupTitle}>Dimensione output</div>
              <div className={styles.filterRow}>
                <div className={styles.filterLabel}>
                  <span>Ridimensiona</span>
                  <span className={styles.filterVal}>{outputSize}%</span>
                </div>
                <input type="range" min={10} max={100} step={5} value={outputSize}
                  onChange={e => setOutputSize(parseInt(e.target.value))}
                  className={styles.slider} />
              </div>
              {cropBox.w>0&&cropBox.h>0&&(
                <div className={styles.previewHint}>
                  Salva a: {Math.round(cropBox.w/imgSize.scale*outputSize/100)}×{Math.round(cropBox.h/imgSize.scale*outputSize/100)} px
                </div>
              )}
            </>}

            {/* EFFECTS controls */}
            {tab==='effects' && <div className={styles.filterControls}>
              <div className={styles.groupTitle}>Correzioni</div>
              <Slider label="Luminosità" value={filters.brightness} min={50} max={150} onChange={v=>setFilters(f=>({...f,brightness:v}))} />
              <Slider label="Contrasto" value={filters.contrast} min={50} max={150} onChange={v=>setFilters(f=>({...f,contrast:v}))} />
              <Slider label="Saturazione" value={filters.saturation} min={0} max={200} onChange={v=>setFilters(f=>({...f,saturation:v}))} />
              <Slider label="Nitidezza" value={filters.sharpness} min={0} max={10} onChange={v=>setFilters(f=>({...f,sharpness:v}))} />
              <Slider label="Bilanc. bianco" value={filters.whiteBalance} min={-50} max={50} unit="" onChange={v=>setFilters(f=>({...f,whiteBalance:v}))} />

              <div className={styles.divider}/>
              <div className={styles.groupTitle}>Sfumatura bordi</div>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Attiva</span>
                <button className={`${styles.toggleBtn} ${edge.enabled?styles.toggleOn:''}`}
                  onClick={() => setEdge(e=>({...e,enabled:!e.enabled}))}>
                  {edge.enabled?'Attiva':'Disattiva'}
                </button>
              </div>
              {edge.enabled && <>
                <Slider label="Intensità" value={edge.intensita} min={0} max={100} unit="%" onChange={v=>setEdge(e=>({...e,intensita:v}))} />
                <Slider label="Ampiezza" value={edge.ampiezza} min={2} max={40} unit="%" onChange={v=>setEdge(e=>({...e,ampiezza:v}))} />
                <div className={styles.blurSidesLabel}>Direzione</div>
                <div className={styles.blurSideBtns}>
                  {sides.map(s=>(
                    <button key={s} className={`${styles.blurSideBtn} ${edge.side===s?styles.activeSide:''}`}
                      onClick={()=>setEdge(e=>({...e,side:s}))}>
                      {s.charAt(0).toUpperCase()+s.slice(1)}
                    </button>
                  ))}
                </div>
              </>}

              <div className={styles.divider}/>
              <button className={styles.resetBtn} onClick={resetAll}>Ripristina tutto</button>
            </div>}

            {/* BRUSH controls */}
            {tab==='brush' && <div className={styles.filterControls}>
              <div className={styles.groupTitle}>Modalità pennello</div>
              <div className={styles.blurSideBtns} style={{marginBottom:16}}>
                {(['sfuma','sfoca','gomma'] as Brush['mode'][]).map(m=>(
                  <button key={m} className={`${styles.blurSideBtn} ${brush.mode===m?styles.activeSide:''}`}
                    onClick={()=>setBrush(b=>({...b,mode:m}))}>
                    {m==='sfuma'?'Sfuma':m==='sfoca'?'Sfoca':'Gomma'}
                  </button>
                ))}
              </div>
              <div className={styles.groupDesc}>
                {brush.mode==='sfuma'&&'Rende trasparente dove dipingi'}
                {brush.mode==='sfoca'&&'Sfoca dove dipingi'}
                {brush.mode==='gomma'&&'Cancella completamente i pixel'}
              </div>
              <div className={styles.divider}/>
              <Slider label="Dimensione pennello" value={brush.size} min={10} max={150} unit="px" onChange={v=>setBrush(b=>({...b,size:v}))} />
              <Slider label="Intensità" value={brush.intensita} min={1} max={100} unit="%" onChange={v=>setBrush(b=>({...b,intensita:v}))} />
              <div className={styles.divider}/>
              <button className={styles.resetBtn} onClick={clearBrush}>Cancella tutto</button>
            </div>}

            {/* MASK controls */}
            {tab==='mask' && <div className={styles.filterControls}>
              <div className={styles.groupTitle}>Forma maschera</div>
              <div className={styles.blurSideBtns} style={{marginBottom:16}}>
                {(['nessuna','ellisse','cerchio'] as MaskShape[]).map(s=>(
                  <button key={s} className={`${styles.blurSideBtn} ${mask.shape===s?styles.activeSide:''}`}
                    onClick={()=>setMask(m=>({...m,shape:s}))}>
                    {s==='nessuna'?'Nessuna':s==='ellisse'?'Ellisse':'Cerchio'}
                  </button>
                ))}
              </div>
              <div className={styles.groupDesc}>
                {mask.shape==='nessuna'&&'Nessuna maschera applicata'}
                {mask.shape==='ellisse'&&'Ritaglia in forma ellittica con bordi morbidi'}
                {mask.shape==='cerchio'&&'Ritaglia in forma circolare con bordi morbidi'}
              </div>
              {mask.shape!=='nessuna' && <>
                <div className={styles.divider}/>
                <Slider label="Morbidezza bordi" value={mask.feather} min={0} max={80} unit="%" onChange={v=>setMask(m=>({...m,feather:v}))} />
              </>}
              <div className={styles.divider}/>
              <button className={styles.resetBtn} onClick={()=>setMask(defaultMask)}>Ripristina</button>
            </div>}

          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onCancel}>Annulla</button>
          <button className={styles.btnConfirm} onClick={handleConfirm}>Salva modifiche →</button>
        </div>
      </div>
    </div>
  )
}
