#!/usr/bin/env python3
import zlib
import struct
import os

def read_png_rgba(file_path):
    with open(file_path, 'rb') as f:
        data = f.read()
    
    assert data[:8] == b'\x89PNG\r\n\x1a\n', "Not a valid PNG"
    pos = 8
    idat_chunks = []
    width, height = None, None
    bit_depth, color_type = None, None
    
    while pos < len(data):
        length, = struct.unpack('>I', data[pos:pos+4])
        chunk_type = data[pos+4:pos+8]
        chunk_data = data[pos+8:pos+8+length]
        pos += 8 + length + 4
        if chunk_type == b'IHDR':
            width, height, bit_depth, color_type, _, _, _ = struct.unpack('>IIBBBBB', chunk_data)
        elif chunk_type == b'IDAT':
            idat_chunks.append(chunk_data)
    
    assert color_type == 6 and bit_depth == 8, f"Expected RGBA 8-bit, got color_type={color_type}, bit_depth={bit_depth}"
    decompressed = zlib.decompress(b''.join(idat_chunks))
    
    # Parse filter bytes per scanline (unfilter)
    stride = 1 + width * 4
    pixels = bytearray(width * height * 4)
    
    def paeth_predictor(a, b, c):
        p = a + b - c
        pa = abs(p - a)
        pb = abs(p - b)
        pc = abs(p - c)
        if pa <= pb and pa <= pc:
            return a
        elif pb <= pc:
            return b
        else:
            return c

    for y in range(height):
        filter_type = decompressed[y * stride]
        line = decompressed[y * stride + 1 : (y + 1) * stride]
        for x in range(width * 4):
            val = line[x]
            left = pixels[y * width * 4 + x - 4] if x >= 4 else 0
            up = pixels[(y - 1) * width * 4 + x] if y > 0 else 0
            upleft = pixels[(y - 1) * width * 4 + x - 4] if (y > 0 and x >= 4) else 0
            
            if filter_type == 0: # None
                recon = val
            elif filter_type == 1: # Sub
                recon = (val + left) & 0xff
            elif filter_type == 2: # Up
                recon = (val + up) & 0xff
            elif filter_type == 3: # Average
                recon = (val + ((left + up) // 2)) & 0xff
            elif filter_type == 4: # Paeth
                recon = (val + paeth_predictor(left, up, upleft)) & 0xff
            else:
                recon = val
            pixels[y * width * 4 + x] = recon
            
    return width, height, pixels

def make_png(width, height, rgba_pixels):
    raw = bytearray()
    for y in range(height):
        raw.append(0) # filter 0 (None)
        raw.extend(rgba_pixels[y * width * 4 : (y + 1) * width * 4])
    
    compressed = zlib.compress(bytes(raw), 9)
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png.extend(struct.pack('>I', len(ihdr)))
    png.extend(b'IHDR')
    png.extend(ihdr)
    png.extend(struct.pack('>I', zlib.crc32(b'IHDR' + ihdr) & 0xffffffff))
    
    # IDAT
    png.extend(struct.pack('>I', len(compressed)))
    png.extend(b'IDAT')
    png.extend(compressed)
    png.extend(struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
    
    # IEND
    png.extend(struct.pack('>I', 0))
    png.extend(b'IEND')
    png.extend(struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
    
    return bytes(png)

def bilinear_resize(src_w, src_h, src_pixels, dst_w, dst_h):
    dst = bytearray(dst_w * dst_h * 4)
    x_ratio = float(src_w - 1) / dst_w if dst_w > 1 else 0
    y_ratio = float(src_h - 1) / dst_h if dst_h > 1 else 0
    
    for y in range(dst_h):
        src_y = int(y_ratio * y)
        y_diff = (y_ratio * y) - src_y
        for x in range(dst_w):
            src_x = int(x_ratio * x)
            x_diff = (x_ratio * x) - src_x
            
            idx_a = (src_y * src_w + src_x) * 4
            idx_b = (src_y * src_w + min(src_x + 1, src_w - 1)) * 4
            idx_c = (min(src_y + 1, src_h - 1) * src_w + src_x) * 4
            idx_d = (min(src_y + 1, src_h - 1) * src_w + min(src_x + 1, src_w - 1)) * 4
            
            for c in range(4): # R, G, B, A
                val_a = src_pixels[idx_a + c]
                val_b = src_pixels[idx_b + c]
                val_c = src_pixels[idx_c + c]
                val_d = src_pixels[idx_d + c]
                
                interp = (
                    val_a * (1 - x_diff) * (1 - y_diff) +
                    val_b * x_diff * (1 - y_diff) +
                    val_c * (1 - x_diff) * y_diff +
                    val_d * x_diff * y_diff
                )
                dst[(y * dst_w + x) * 4 + c] = min(255, max(0, int(interp)))
                
    return dst

def create_square_icon(src_w, src_h, src_pixels, size, bg_color=(255, 255, 255, 255), scale_ratio=0.78):
    # Determine resized logo dimensions to fit in safe circle
    target_w = int(size * scale_ratio)
    target_h = int(src_h * (target_w / src_w))
    
    resized = bilinear_resize(src_w, src_h, src_pixels, target_w, target_h)
    
    # Create canvas
    canvas = bytearray(bg_color * (size * size))
    
    offset_x = (size - target_w) // 2
    offset_y = (size - target_h) // 2
    
    bg_r, bg_g, bg_b, bg_a = bg_color
    
    for y in range(target_h):
        for x in range(target_w):
            s_idx = (y * target_w + x) * 4
            sr, sg, sb, sa = resized[s_idx : s_idx + 4]
            if sa == 0:
                continue
            
            c_idx = ((offset_y + y) * size + (offset_x + x)) * 4
            
            # Alpha composite over canvas
            alpha = sa / 255.0
            inv_alpha = 1.0 - alpha
            
            canvas[c_idx] = int(sr * alpha + bg_r * inv_alpha)
            canvas[c_idx + 1] = int(sg * alpha + bg_g * inv_alpha)
            canvas[c_idx + 2] = int(sb * alpha + bg_b * inv_alpha)
            canvas[c_idx + 3] = int(255 * (alpha + (bg_a / 255.0) * inv_alpha))
            
    return make_png(size, size, canvas)

def main():
    repo_dir = "/home/enrique/Documentos/GitHub/hackathon-ia-congreso-social-2026-desafio2"
    logo_path = os.path.join(repo_dir, "public/logos/logo_puente.png")
    
    src_w, src_h, src_pixels = read_png_rgba(logo_path)
    print(f"Loaded logo: {src_w}x{src_h}")
    
    # 1. 192x192
    png_192 = create_square_icon(src_w, src_h, src_pixels, 192, bg_color=(255, 255, 255, 255), scale_ratio=0.80)
    # 2. 512x512
    png_512 = create_square_icon(src_w, src_h, src_pixels, 512, bg_color=(255, 255, 255, 255), scale_ratio=0.80)
    # 3. 180x180 Apple Touch Icon
    png_180 = create_square_icon(src_w, src_h, src_pixels, 180, bg_color=(255, 255, 255, 255), scale_ratio=0.80)
    # 4. Maskable icons with warm background (#FAF8F6 = 250, 248, 246) and conservative safe zone (0.68)
    png_mask_192 = create_square_icon(src_w, src_h, src_pixels, 192, bg_color=(250, 248, 246, 255), scale_ratio=0.68)
    png_mask_512 = create_square_icon(src_w, src_h, src_pixels, 512, bg_color=(250, 248, 246, 255), scale_ratio=0.68)
    
    targets = [
        ("public/icon-192.png", png_192),
        ("public/icon-512.png", png_512),
        ("public/apple-touch-icon.png", png_180),
        ("public/icon-maskable-192.png", png_mask_192),
        ("public/icon-maskable-512.png", png_mask_512),
        ("static/icon-192.png", png_192),
        ("static/icon-512.png", png_512),
    ]
    
    for rel_path, png_bytes in targets:
        full_path = os.path.join(repo_dir, rel_path)
        with open(full_path, 'wb') as f:
            f.write(png_bytes)
        print(f"Generated {rel_path}: {len(png_bytes)} bytes")

if __name__ == "__main__":
    main()
