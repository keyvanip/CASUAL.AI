import os
import json
import numpy as np
import cv2
from PIL import Image
from rembg import remove
import trimesh

# predict bbox of the foreground
def pred_bbox(image):
    image_nobg = remove(image.convert('RGBA'), alpha_matting=True)
    alpha = np.asarray(image_nobg)[:,:,-1]
    x_nonzero = np.nonzero(alpha.sum(axis=0))
    y_nonzero = np.nonzero(alpha.sum(axis=1))
    x_min = int(x_nonzero[0].min())
    y_min = int(y_nonzero[0].min())
    x_max = int(x_nonzero[0].max())
    y_max = int(y_nonzero[0].max())
    return x_min, y_min, x_max, y_max


# contrast correction, rescale and recenter
def image_preprocess_nosave(input_image, lower_contrast=True, rescale=True):

    image_arr = np.array(input_image)
    in_w, in_h = image_arr.shape[:2]

    if lower_contrast:
        alpha = 0.8  # Contrast control (1.0-3.0)
        beta =  0   # Brightness control (0-100)
        # Apply the contrast adjustment
        image_arr = cv2.convertScaleAbs(image_arr, alpha=alpha, beta=beta)
        image_arr[image_arr[...,-1]>200, -1] = 255

    ret, mask = cv2.threshold(np.array(input_image.split()[-1]), 0, 255, cv2.THRESH_BINARY)
    x, y, w, h = cv2.boundingRect(mask)
    max_size = max(w, h)
    ratio = 0.75
    if rescale:
        side_len = int(max_size / ratio)
    else:
        side_len = in_w
    padded_image = np.zeros((side_len, side_len, 4), dtype=np.uint8)
    center = side_len//2
    padded_image[center-h//2:center-h//2+h, center-w//2:center-w//2+w] = image_arr[y:y+h, x:x+w]
    rgba = Image.fromarray(padded_image).resize((256, 256), Image.LANCZOS)

    rgba_arr = np.array(rgba) / 255.0
    rgb = rgba_arr[...,:3] * rgba_arr[...,-1:] + (1 - rgba_arr[...,-1:])
    return Image.fromarray((rgb * 255).astype(np.uint8))