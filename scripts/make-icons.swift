// Renders the KotobaMichi app icons: a white 道 on the brand red, matching the navbar mark.
// Run from the repository root:  swift scripts/make-icons.swift apps/web/public/icons
// Needs macOS (AppKit and the Hiragino Sans W7 system font).
import AppKit

let red = NSColor(srgbRed: 0xD8 / 255.0, green: 0x15 / 255.0, blue: 0x1E / 255.0, alpha: 1)
let glyph = "道"

/// `rounded`: a rounded tile on a transparent background. Otherwise a full square,
/// which iOS and maskable Android icons need because the system applies its own mask.
/// `glyphScale`: the glyph's size as a share of the canvas. Maskable icons keep it
/// inside the central safe zone.
func render(size: Int, rounded: Bool, glyphScale: CGFloat) -> Data {
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8,
        samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB,
        bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    let side = CGFloat(size)
    let rect = NSRect(x: 0, y: 0, width: side, height: side)
    NSColor.clear.setFill()
    rect.fill()
    red.setFill()
    if rounded {
        NSBezierPath(roundedRect: rect, xRadius: side * 0.22, yRadius: side * 0.22).fill()
    } else {
        rect.fill()
    }

    let font = NSFont(name: "HiraginoSans-W7", size: side * glyphScale)
        ?? NSFont.boldSystemFont(ofSize: side * glyphScale)
    let text = NSAttributedString(string: glyph, attributes: [.font: font, .foregroundColor: NSColor.white])
    // Centre on the glyph's ink, not its line box, so it sits optically in the middle.
    let line = CTLineCreateWithAttributedString(text)
    let ink = CTLineGetImageBounds(line, nil)
    let ctx = NSGraphicsContext.current!.cgContext
    ctx.textPosition = CGPoint(x: (side - ink.width) / 2 - ink.minX, y: (side - ink.height) / 2 - ink.minY)
    CTLineDraw(line, ctx)

    NSGraphicsContext.restoreGraphicsState()
    return rep.representation(using: .png, properties: [:])!
}

let out = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "."
let icons: [(String, Int, Bool, CGFloat)] = [
    ("favicon-16.png", 16, true, 0.78),
    ("favicon-32.png", 32, true, 0.74),
    ("favicon-48.png", 48, true, 0.72),
    ("icon-192.png", 192, true, 0.66),
    ("icon-512.png", 512, true, 0.66),
    ("apple-touch-icon.png", 180, false, 0.62),
    ("maskable-512.png", 512, false, 0.5),
]
for (name, size, rounded, scale) in icons {
    let url = URL(fileURLWithPath: out).appendingPathComponent(name)
    try! render(size: size, rounded: rounded, glyphScale: scale).write(to: url)
    print("wrote \(url.path)")
}
