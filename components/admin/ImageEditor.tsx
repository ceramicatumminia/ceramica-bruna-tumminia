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
}

const defaultFilters: Filters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
}

type BlurSide = 'radiale' | 'sinistra' | 'destra' | 'alto' | 'basso'

type BlurSettings = {
  intensita: number
  ampiezza: number
  lato: BlurSide
}

const defaultBlur: BlurSettings = {
  intensita: 0,
  ampiezza: 30,
  lato: 'radiale',
}

export default function ImageEditor({ file, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [blur, setBlur] = useState<BlurSettings>(defaultBlur)
  const [tab, setTab] = useState<'crop' | 'filters'>('crop')

  // Crop state
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragMode, setDragMode] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se' | 'new'>('new')
  const [imgSize, setImgSize] = useState({ w: 0, h: 0, scale: 1 })

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      imgRef.current = img
      const maxW = 680
      const maxH = 460
      const scale = Math.min(maxW / img.width, maxH / img.height, 1)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      setImgSize({ w, h, scale })
      setCropBox({ x: 0, y: 0, w, h })
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Draw preview with filters and blur
  const drawPreview = useCallback((
    img: HTMLImageElement,
    crop: { x: number; y: number; w: number; h: number },
    scale: number,
    f: Filters,
    b: BlurSettings
  ) => {
    const canvas = previewRef.current
    if (!canvas || crop.w < 1 || crop.h < 1) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = crop.w
    canvas.height = crop.h

    // Draw base image with CSS filters
    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`
    ctx.drawImage(
      img,
      crop.x / scale, crop.y / scale, crop.w / scale, crop.h / scale,
      0, 0, crop.w, crop.h
    )
    ctx.filter = 'none'

    // Apply edge blur if needed
    if (b.intensita > 0) {
      const blurPx = b.intensita * 0.5

      // Create blurred version
      const blurCanvas = document.createElement('canvas')
      blurCanvas.width = crop.w
      blurCanvas.height = crop.h
      const bCtx = blurCanvas.getContext('2d')!
      bCtx.filter = `blur(${blurPx}px) brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`
      bCtx.drawImage(img, crop.x / scale, crop.y / scale, crop.w / scale, crop.h / scale, 0, 0, crop.w, crop.h)
      bCtx.filter = 'none'

      // Create mask based on side
      const maskCanvas = document.createElement('canvas')
      maskCanvas.width = crop.w
      maskCanvas.height = crop.h
      const mCtx = maskCanvas.getContext('2d')!

      const fadeSize = (b.ampiezza / 100) * Math.min(crop.w, crop.h)
      let grad: CanvasGradient

      if (b.lato === 'radiale') {
        // Radial: center clear, edges blurred
        const innerR = Math.min(crop.w, crop.h) * ((100 - b.ampiezza) / 100) * 0.5
        const outerR = Math.max(crop.w, crop.h) * 0.75
        grad = mCtx.createRadialGradient(crop.w/2, crop.h/2, innerR, crop.w/2, crop.h/2, outerR)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(1, 'rgba(0,0,0,1)')
      } else if (b.lato === 'sinistra') {
        grad = mCtx.createLinearGradient(0, 0, fadeSize, 0)
        grad.addColorStop(0, 'rgba(0,0,0,1)')
        grad.addColorStop(1, 'rgba(0,0,0,0)')
      } else if (b.lato === 'destra') {
        grad = mCtx.createLinearGradient(crop.w - fadeSize, 0, crop.w, 0)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(1, 'rgba(0,0,0,1)')
      } else if (b.lato === 'alto') {
        grad = mCtx.createLinearGradient(0, 0, 0, fadeSize)
        grad.addColorStop(0, 'rgba(0,0,0,1)')
        grad.addColorStop(1, 'rgba(0,0,0,0)')
      } else { // basso
        grad = mCtx.createLinearGradient(0, crop.h - fadeSize, 0, crop.h)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(1, 'rgba(0,0,0,1)')
      }

      mCtx.fillStyle = grad
      mCtx.fillRect(0, 0, crop.w, crop.h)

      // Composite: use mask to blend blurred on top of sharp
      // Draw blurred as base
      const compositeCanvas = document.createElement('canvas')
      compositeCanvas.width = crop.w
      compositeCanvas.height = crop.h
      const cCtx = compositeCanvas.getContext('2d')!
      cCtx.drawImage(canvas, 0, 0) // sharp base
      
      // Draw blurred where mask is white
      cCtx.save()
      cCtx.globalCompositeOperation = 'source-over'
      // Use mask as alpha
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = crop.w
      tempCanvas.height = crop.h
      const tCtx = tempCanvas.getContext('2d')!
      tCtx.drawImage(blurCanvas, 0, 0)
      tCtx.globalCompositeOperation = 'destination-in'
      tCtx.drawImage(maskCanvas, 0, 0)
      cCtx.drawImage(tempCanvas, 0, 0)
      cCtx.restore()

      ctx.clearRect(0, 0, crop.w, crop.h)
      ctx.drawImage(compositeCanvas, 0, 0)
    }
  }, [])

  useEffect(() => {
    if (imgRef.current && imgSize.w > 0) {
      drawPreview(imgRef.current, cropBox, imgSize.scale, filters, blur)
    }
  }, [filters, blur, cropBox, imgSize, drawPreview])

  // Draw crop overlay
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current || imgSize.w === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = imgSize.w
    canvas.height = imgSize.h

    ctx.drawImage(imgRef.current, 0, 0, imgSize.w, imgSize.h)

    // Dim outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, imgSize.w, imgSize.h)

    // Clear crop area
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h)
    ctx.drawImage(imgRef.current,
      cropBox.x / imgSize.scale, cropBox.y / imgSize.scale,
      cropBox.w / imgSize.scale, cropBox.h / imgSize.scale,
      cropBox.x, cropBox.y, cropBox.w, cropBox.h
    )

    // Crop border
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 1.5
    ctx.strokeRect(cropBox.x + 0.5, cropBox.y + 0.5, cropBox.w - 1, cropBox.h - 1)

    // Rule of thirds lines
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
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

    // Corner handles — L-shaped
    const hs = 14 // handle size
    const hw = 2.5 // line width
    const corners = [
      { x: cropBox.x, y: cropBox.y, dx: 1, dy: 1 },
      { x: cropBox.x + cropBox.w, y: cropBox.y, dx: -1, dy: 1 },
      { x: cropBox.x, y: cropBox.y + cropBox.h, dx: 1, dy: -1 },
      { x: cropBox.x + cropBox.w, y: cropBox.y + cropBox.h, dx: -1, dy: -1 },
    ]
    ctx.strokeStyle = 'white'
    ctx.lineWidth = hw
    corners.forEach(({ x, y, dx, dy }) => {
      ctx.beginPath()
      ctx.moveTo(x + dx * hs, y)
      ctx.lineTo(x, y)
      ctx.lineTo(x, y + dy * hs)
      ctx.stroke()
    })
  }, [cropBox, imgSize])

  const HANDLE_SIZE = 16

  const getHandle = (mx: number, my: number) => {
    const { x, y, w, h } = cropBox
    const near = (ax: number, ay: number) =>
      Math.abs(mx - ax) < HANDLE_SIZE && Math.abs(my - ay) < HANDLE_SIZE
    if (near(x, y)) return 'nw'
    if (near(x + w, y)) return 'ne'
    if (near(x, y + h)) return 'sw'
    if (near(x + w, y + h)) return 'se'
    return null
  }

  const inCrop = (mx: number, my: number) => {
    const { x, y, w, h } = cropBox
    return mx >= x && mx <= x + w && my >= y && my <= y + h
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const handle = getHandle(mx, my)
    if (handle) {
      setDragMode(handle as any)
    } else if (inCrop(mx, my)) {
      setDragMode('move')
    } else {
      setDragMode('new')
      setCropBox({ x: mx, y: my, w: 0, h: 0 })
    }
    setDragStart({ x: mx, y: my })
    setDragging(true)
  }

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = clamp(e.clientX - rect.left, 0, imgSize.w)
    const my = clamp(e.clientY - rect.top, 0, imgSize.h)
    const dx = mx - dragStart.x
    const dy = my - dragStart.y

    if (dragMode === 'new') {
      const x = dx >= 0 ? dragStart.x : mx
      const y = dy >= 0 ? dragStart.y : my
      setCropBox({ x: clamp(x,0,imgSize.w), y: clamp(y,0,imgSize.h), w: Math.abs(dx), h: Math.abs(dy) })
    } else if (dragMode === 'move') {
      setCropBox(prev => ({
        ...prev,
        x: clamp(prev.x + dx, 0, imgSize.w - prev.w),
        y: clamp(prev.y + dy, 0, imgSize.h - prev.h),
      }))
      setDragStart({ x: mx, y: my })
    } else {
      setCropBox(prev => {
        let { x, y, w, h } = prev
        if (dragMode === 'se') { w = clamp(mx - x, 20, imgSize.w - x); h = clamp(my - y, 20, imgSize.h - y) }
        if (dragMode === 'sw') { const nx = clamp(mx, 0, x + w - 20); w = x + w - nx; x = nx; h = clamp(my - y, 20, imgSize.h - y) }
        if (dragMode === 'ne') { w = clamp(mx - x, 20, imgSize.w - x); const ny = clamp(my, 0, y + h - 20); h = y + h - ny; y = ny }
        if (dragMode === 'nw') { const nx = clamp(mx, 0, x + w - 20); w = x + w - nx; x = nx; const ny = clamp(my, 0, y + h - 20); h = y + h - ny; y = ny }
        return { x, y, w, h }
      })
    }
  }

  const getCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging) return dragMode === 'move' ? 'grabbing' : 'crosshair'
    const rect = canvasRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const handle = getHandle(mx, my)
    if (handle === 'nw' || handle === 'se') return 'nwse-resize'
    if (handle === 'ne' || handle === 'sw') return 'nesw-resize'
    if (inCrop(mx, my)) return 'grab'
    return 'crosshair'
  }

  const [cursor, setCursor] = useState('crosshair')

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
    { key: 'brightness', label: 'Luminosità', min: 50, max: 150 },
    { key: 'contrast', label: 'Contrasto', min: 50, max: 150 },
    { key: 'saturation', label: 'Saturazione', min: 0, max: 200 },
  ]

  const blurSides: { key: BlurSide; label: string }[] = [
    { key: 'radiale', label: 'Radiale' },
    { key: 'sinistra', label: 'Sinistra' },
    { key: 'destra', label: 'Destra' },
    { key: 'alto', label: 'Alto' },
    { key: 'basso', label: 'Basso' },
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
          <div className={styles.canvasWrap}>
            {tab === 'crop' && (
              <>
                <canvas
                  ref={canvasRef}
                  className={styles.mainCanvas}
                  onMouseDown={handleMouseDown}
                  onMouseMove={e => { handleMouseMove(e); setCursor(getCursor(e)) }}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ cursor }}
                />
                <div className={styles.cropActions}>
                  <button className={styles.resetBtn} onClick={resetCrop}>Reset crop</button>
                  <span className={styles.hint}>Trascina gli angoli per ritagliare · Trascina al centro per spostare</span>
                </div>
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
                      type="range" min={fc.min} max={fc.max}
                      value={filters[fc.key as keyof Filters]}
                      onChange={e => setFilters(f => ({ ...f, [fc.key]: parseInt(e.target.value) }))}
                      className={styles.slider}
                    />
                  </div>
                ))}

                <div className={styles.divider} />

                <div className={styles.blurSection}>
                  <div className={styles.blurTitle}>Sfocatura bordi</div>

                  <div className={styles.filterRow}>
                    <div className={styles.filterLabel}>
                      <span>Intensità</span>
                      <span className={styles.filterVal}>{blur.intensita}</span>
                    </div>
                    <input type="range" min={0} max={40} value={blur.intensita}
                      onChange={e => setBlur(b => ({ ...b, intensita: parseInt(e.target.value) }))}
                      className={styles.slider} />
                  </div>

                  {blur.intensita > 0 && (
                    <>
                      <div className={styles.filterRow}>
                        <div className={styles.filterLabel}>
                          <span>Ampiezza sfumatura</span>
                          <span className={styles.filterVal}>{blur.ampiezza}%</span>
                        </div>
                        <input type="range" min={10} max={70} value={blur.ampiezza}
                          onChange={e => setBlur(b => ({ ...b, ampiezza: parseInt(e.target.value) }))}
                          className={styles.slider} />
                      </div>

                      <div className={styles.blurSides}>
                        <div className={styles.blurSidesLabel}>Direzione</div>
                        <div className={styles.blurSideBtns}>
                          {blurSides.map(s => (
                            <button
                              key={s.key}
                              className={`${styles.blurSideBtn} ${blur.lato === s.key ? styles.activeSide : ''}`}
                              onClick={() => setBlur(b => ({ ...b, lato: s.key }))}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button className={styles.resetBtn} style={{marginTop: '20px'}} onClick={() => { setFilters(defaultFilters); setBlur(defaultBlur) }}>
                  Ripristina tutto
                </button>
              </div>
            )}
          </div>

          <div className={styles.previewWrap}>
            <div className={styles.previewLabel}>Anteprima</div>
            <div className={styles.previewBox}>
              <canvas ref={previewRef} className={styles.previewCanvas} />
            </div>
            <div className={styles.previewHint}>
              {cropBox.w > 0 && cropBox.h > 0 && (
                <span>{Math.round(cropBox.w / imgSize.scale)} × {Math.round(cropBox.h / imgSize.scale)} px</span>
              )}
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
