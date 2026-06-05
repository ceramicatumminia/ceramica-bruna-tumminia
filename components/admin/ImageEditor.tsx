'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './ImageEditor.module.css'

type Props = {
  file: File
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

type Filters = {
  brightness: number
  contrast: number
  saturation: number
  vignette: number
  blur: number
}

const defaultFilters: Filters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  vignette: 0,
  blur: 0,
}

type AspectRatio = 'free' | '1:1' | '4:3' | '3:2' | '16:9'

export default function ImageEditor({ file, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [aspect, setAspect] = useState<AspectRatio>('free')
  const [tab, setTab] = useState<'crop' | 'filters'>('crop')

  // Crop state
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'new'>('new')
  const [imgSize, setImgSize] = useState({ w: 0, h: 0, scale: 1 })

  // Load image
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      imgRef.current = img
      const maxW = 700
      const maxH = 480
      const scale = Math.min(maxW / img.width, maxH / img.height, 1)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      setImgSize({ w, h, scale })
      setCropBox({ x: 0, y: 0, w, h })
      drawPreview(img, { x: 0, y: 0, w, h }, scale, defaultFilters)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  const drawPreview = useCallback((
    img: HTMLImageElement,
    crop: { x: number; y: number; w: number; h: number },
    scale: number,
    f: Filters
  ) => {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = crop.w
    canvas.height = crop.h

    // Apply CSS filters
    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`

    // Draw cropped portion
    ctx.drawImage(
      img,
      crop.x / scale, crop.y / scale, crop.w / scale, crop.h / scale,
      0, 0, crop.w, crop.h
    )

    // Apply blur on edges
    if (f.blur > 0) {
      const blurCanvas = document.createElement('canvas')
      blurCanvas.width = crop.w
      blurCanvas.height = crop.h
      const bCtx = blurCanvas.getContext('2d')!
      bCtx.filter = `blur(${f.blur * 3}px)`
      bCtx.drawImage(canvas, 0, 0)

      // Blend: original center + blurred edges via radial gradient mask
      const maskCanvas = document.createElement('canvas')
      maskCanvas.width = crop.w
      maskCanvas.height = crop.h
      const mCtx = maskCanvas.getContext('2d')!

      const grd = mCtx.createRadialGradient(
        crop.w / 2, crop.h / 2, Math.min(crop.w, crop.h) * 0.25,
        crop.w / 2, crop.h / 2, Math.max(crop.w, crop.h) * 0.7
      )
      grd.addColorStop(0, 'rgba(0,0,0,1)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      mCtx.fillStyle = grd
      mCtx.fillRect(0, 0, crop.w, crop.h)

      // Draw blurred base
      ctx.drawImage(blurCanvas, 0, 0)
      // Composite original on top using mask
      ctx.globalCompositeOperation = 'destination-over'
      ctx.drawImage(canvas, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
    }

    ctx.filter = 'none'

    // Vignette
    if (f.vignette > 0) {
      const vgrd = ctx.createRadialGradient(
        crop.w / 2, crop.h / 2, Math.min(crop.w, crop.h) * 0.3,
        crop.w / 2, crop.h / 2, Math.max(crop.w, crop.h) * 0.8
      )
      vgrd.addColorStop(0, 'rgba(0,0,0,0)')
      vgrd.addColorStop(1, `rgba(0,0,0,${f.vignette / 100})`)
      ctx.fillStyle = vgrd
      ctx.fillRect(0, 0, crop.w, crop.h)
    }
  }, [])

  useEffect(() => {
    if (imgRef.current && imgSize.w > 0) {
      drawPreview(imgRef.current, cropBox, imgSize.scale, filters)
    }
  }, [filters, cropBox, imgSize, drawPreview])

  // Draw crop overlay on main canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current || imgSize.w === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = imgSize.w
    canvas.height = imgSize.h

    // Draw image
    ctx.drawImage(imgRef.current, 0, 0, imgSize.w, imgSize.h)

    // Dim outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, imgSize.w, imgSize.h)

    // Clear crop area
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)
    ctx.drawImage(imgRef.current,
      cropBox.x / imgSize.scale, cropBox.y / imgSize.scale,
      cropBox.w / imgSize.scale, cropBox.h / imgSize.scale,
      cropBox.x, cropBox.y, cropBox.w, cropBox.h
    )

    // Crop border
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)

    // Rule of thirds
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 0.5
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(cropBox.x + (cropBox.w / 3) * i, cropBox.y)
      ctx.lineTo(cropBox.x + (cropBox.w / 3) * i, cropBox.y + cropBox.h)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cropBox.x, cropBox.y + (cropBox.h / 3) * i)
      ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + (cropBox.h / 3) * i)
      ctx.stroke()
    }

    // Handles
    const handles = [
      [cropBox.x, cropBox.y],
      [cropBox.x + cropBox.w, cropBox.y],
      [cropBox.x, cropBox.y + cropBox.h],
      [cropBox.x + cropBox.w, cropBox.y + cropBox.h],
    ]
    handles.forEach(([hx, hy]) => {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(hx, hy, 5, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [cropBox, imgSize])

  const getAspectCrop = (x: number, y: number, w: number, h: number): { w: number; h: number } => {
    if (aspect === 'free') return { w, h }
    const ratios: Record<string, number> = { '1:1': 1, '4:3': 4/3, '3:2': 3/2, '16:9': 16/9 }
    const r = ratios[aspect]
    if (w / h > r) return { w: Math.round(h * r), h }
    return { w, h: Math.round(w / r) }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const inCrop = mx >= cropBox.x && mx <= cropBox.x + cropBox.w &&
                   my >= cropBox.y && my <= cropBox.y + cropBox.h
    const nearEdge = (v: number, edge: number) => Math.abs(v - edge) < 12

    if (nearEdge(mx, cropBox.x + cropBox.w) && nearEdge(my, cropBox.y + cropBox.h)) {
      setDragMode('resize')
    } else if (inCrop) {
      setDragMode('move')
    } else {
      setDragMode('new')
      setCropBox({ x: mx, y: my, w: 0, h: 0 })
    }
    setDragStart({ x: mx, y: my })
    setDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = Math.max(0, Math.min(e.clientX - rect.left, imgSize.w))
    const my = Math.max(0, Math.min(e.clientY - rect.top, imgSize.h))
    const dx = mx - dragStart.x
    const dy = my - dragStart.y

    if (dragMode === 'new') {
      const rawW = Math.abs(dx)
      const rawH = Math.abs(dy)
      const { w, h } = getAspectCrop(0, 0, rawW, rawH)
      const x = dx >= 0 ? dragStart.x : dragStart.x - w
      const y = dy >= 0 ? dragStart.y : dragStart.y - h
      setCropBox({
        x: Math.max(0, x),
        y: Math.max(0, y),
        w: Math.min(w, imgSize.w - Math.max(0, x)),
        h: Math.min(h, imgSize.h - Math.max(0, y))
      })
    } else if (dragMode === 'move') {
      setCropBox(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + dx, imgSize.w - prev.w)),
        y: Math.max(0, Math.min(prev.y + dy, imgSize.h - prev.h)),
      }))
      setDragStart({ x: mx, y: my })
    } else if (dragMode === 'resize') {
      const newW = Math.max(20, cropBox.x + dx > 0 ? mx - cropBox.x : 20)
      const newH = Math.max(20, my - cropBox.y)
      const { w, h } = getAspectCrop(0, 0, newW, newH)
      setCropBox(prev => ({
        ...prev,
        w: Math.min(w, imgSize.w - prev.x),
        h: Math.min(h, imgSize.h - prev.y)
      }))
    }
  }

  const handleMouseUp = () => setDragging(false)

  const resetCrop = () => {
    if (imgSize.w > 0) setCropBox({ x: 0, y: 0, w: imgSize.w, h: imgSize.h })
  }

  const handleConfirm = () => {
    const canvas = previewRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (blob) onConfirm(blob)
    }, 'image/jpeg', 0.92)
  }

  const filterConfig = [
    { key: 'brightness', label: 'Luminosità', min: 50, max: 150, default: 100 },
    { key: 'contrast', label: 'Contrasto', min: 50, max: 150, default: 100 },
    { key: 'saturation', label: 'Saturazione', min: 0, max: 200, default: 100 },
    { key: 'vignette', label: 'Vignette (bordi scuri)', min: 0, max: 80, default: 0 },
    { key: 'blur', label: 'Sfocatura bordi', min: 0, max: 20, default: 0 },
  ]

  return (
    <div className={styles.overlay}>
      <div className={styles.editor}>
        <div className={styles.header}>
          <span className={styles.title}>Editor immagine</span>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'crop' ? styles.activeTab : ''}`} onClick={() => setTab('crop')}>Ritaglia</button>
            <button className={`${styles.tab} ${tab === 'filters' ? styles.activeTab : ''}`} onClick={() => setTab('filters')}>Effetti</button>
          </div>
        </div>

        <div className={styles.body}>
          {/* Left: canvas */}
          <div className={styles.canvasWrap}>
            {tab === 'crop' && (
              <>
                <div className={styles.aspectBtns}>
                  {(['free','1:1','4:3','3:2','16:9'] as AspectRatio[]).map(r => (
                    <button key={r} className={`${styles.aspectBtn} ${aspect === r ? styles.activeAspect : ''}`} onClick={() => setAspect(r)}>{r}</button>
                  ))}
                  <button className={styles.resetBtn} onClick={resetCrop}>Reset</button>
                </div>
                <canvas
                  ref={canvasRef}
                  className={styles.mainCanvas}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor: dragging ? 'crosshair' : 'default' }}
                />
                <p className={styles.hint}>Trascina per ritagliare · Trascina l&apos;angolo per ridimensionare</p>
              </>
            )}
            {tab === 'filters' && (
              <div className={styles.filterControls}>
                {filterConfig.map(fc => (
                  <div key={fc.key} className={styles.filterRow}>
                    <div className={styles.filterLabel}>
                      <span>{fc.label}</span>
                      <span className={styles.filterVal}>{filters[fc.key as keyof Filters]}</span>
                    </div>
                    <input
                      type="range"
                      min={fc.min}
                      max={fc.max}
                      value={filters[fc.key as keyof Filters]}
                      onChange={e => setFilters(f => ({ ...f, [fc.key]: parseInt(e.target.value) }))}
                      className={styles.slider}
                    />
                  </div>
                ))}
                <button className={styles.resetBtn} onClick={() => setFilters(defaultFilters)}>
                  Ripristina effetti
                </button>
              </div>
            )}
          </div>

          {/* Right: preview */}
          <div className={styles.previewWrap}>
            <div className={styles.previewLabel}>Anteprima</div>
            <div className={styles.previewBox}>
              <canvas ref={previewRef} className={styles.previewCanvas} />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onCancel}>Annulla</button>
          <button className={styles.btnConfirm} onClick={handleConfirm}>Usa questa foto →</button>
        </div>
      </div>
    </div>
  )
}
