# V0.1 素材来源与生成说明

使用内置 imagegen 工具（非 CLI / API fallback）。
用户原始参考保留在 references：三视图.png、材质图.png、细节图.png、场景图.HEIC。
角色以三视图为造型依据；场景以 HEIC 图为构图依据。
HEIC 经 Windows 系统解码查看；生成工具接收会话可见参考图。以下为最终使用的生成提示。

## 角色 → src/assets/character/friend-source.png

Create a production transparent PNG character sprite from the front-view character at LEFT of the referenced model sheet. Preserve exact original character: yellow plush flame/drop-shaped body with three uneven pointed lobes atop head, big blue oval eyes, white rims, black lashes, pink cheeks, tiny curved black smile, yellow little hands and feet, creamy white shoes. Front view, full body, arms relaxed. Preserve original identity and plush texture. One character only, actual transparent background, no floor, no shadows outside character, no text/measurements/other views. Not a Minion; no goggles or overalls. Return local saved file path.

## 日景 → src/assets/scenes/forest-source.png

Use case: precise-object-edit. Reference image is the user's forest scene for a playable H5 experience. Create a background plate matching its high quality cinematic cozy realistic fairy woodland aesthetic. Keep magnificent old oak with textured mossy trunk in upper center and right, sunlight from upper right, lush canopy, small stream across bottom, moss, tiny mushrooms, atmospheric layered forest. REMOVE ALL THREE yellow characters, guitar, microphones, headphones, coffee cup, mixing desk, furniture and all musical equipment. Restore natural mossy clearing in lower center with ample room to place a separate character sprite. Remove all hanging string lights because interactive lights are separate DOM elements. Keep only forest environment. Landscape 1536x1024, no text, no UI, no characters. Composition must work when center cropped to portrait, clearing at horizontal center lower 70%.

## 夜景 → src/assets/scenes/night-source.png

Use case: lighting-weather. Edit this forest background plate into the SAME EXACT scene at blue-hour night. Preserve tree, stream, ground clearing, roots, mushrooms, leaves, framing and geometry exactly so scene transition aligns. Change only illumination and color mood: rich blue-teal twilight, cool moonlight from upper right, gentle warm luminous mushrooms, small firefly bokeh in distant background. No characters, no UI, no text, no new objects. Keep center mossy ground clearing visible for separately composited character. Landscape 1536x1024.

## 前景 → src/assets/scenes/leaves-source.png

Create a transparent PNG foreground overlay asset for a cinematic realistic magical forest H5 game. Landscape 1536x1024 with actual transparent alpha. ONLY soft-focused rich dark green oak foliage hanging from extreme top-left and top-right corners, and two sparse clusters of ferns at extreme bottom-left and bottom-right corners. Botanical realistic texture, gentle warm rim lighting. Keep CENTRAL 80 percent of canvas entirely EMPTY TRANSPARENT with no objects, all leaves confined to narrow edges. No background, no ground, no tree trunks, no shadows floating across center, no text, no frame, no white canvas. This asset is composited above a forest photo.

## 占位/近似项

- 以上图片为参考图衍生的 V0.1 视觉素材，仍可用最终美术替换；不是原图逐像素抠图。
- 透明雾光为代码生成的轻量中景占位。
- 主树与远景目前合并；整角色招呼代替单独手臂挥手。
- 眨眼是 CSS 眼睑近似，不是单独绘制的角色闭眼图。
- BGM 为程序合成占位，无外部音乐文件；环境音接口暂未配置。

## V0.2 闭眼帧 → src/assets/character/friend-blink-source.png

内置 imagegen，以 V0.1 运行时角色图作为可见参考，生成后保留原图并压缩为 public/assets/character/friend-blink.webp。

Use case: precise-object-edit. Edit this exact transparent character sprite into a BLINK animation frame. Preserve original yellow plush flame-shaped creature perfectly: head lobes, fur texture, exact silhouette, pink cheeks, tiny black smile, both arms hanging down, short legs, white shoes. Change ONLY the two blue eyes: close both into relaxed curved eyelids with fine dark curved eyelash lines and yellow plush eyelids, naturally integrated into fur. No blue eye area remains visible. Keep same front view, body pose, proportions, centered framing, shoe baseline, lighting and size as reference. 1024x1024 square actual transparent alpha background. No backdrop, no floor, no text. This image must match the idle sprite to swap instantly without body shape shifting.

## V0.2 抬手帧 → src/assets/character/friend-wave-source.png

内置 imagegen，以相同 idle 图为参考；运行时使用 public/assets/character/friend-wave.webp。

Use case: precise-object-edit. Create a raised-hand greeting animation frame of this EXACT transparent yellow plush creature sprite. Preserve its exact three uneven flame-shaped head lobes, big blue oval eyes with white rims and lashes, pink cheeks, small black curved smile, yellow plush texture, front-facing body and white shoes. Change ONLY its arm on the VIEWER'S RIGHT: raise and bend that arm so the little open rounded hand is beside the head, palm facing us, cheerful waving pose. Viewer-left arm stays down. Do not raise both arms. Keep head/torso/eyes/feet geometry and lighting identical to reference, centered torso, full body, same shoe baseline. Square 1024x1024 actual transparent alpha background, no floor, no text. Leave space so raised hand is not cropped. This is an animation sprite frame, not a redesign.

V0.2 已替换上文 V0.1 的 CSS 眼睑和原姿态摇摆方案；依然没有骨骼动画。BGM 与环境声均为程序合成，无外部授权音乐/录音。
