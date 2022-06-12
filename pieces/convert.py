import subprocess
import os

for path in os.listdir("."):
    if "svg" in path:
        piece_label, _ = path.split(".")

        # How to convert SVG to base64:
        # https://dirask.com/posts/Bash-convert-svg-to-base64-data-url-DnKqAp
        ps = subprocess.Popen(f"cat {path} | base64 | tr -d '\\r\\n'", shell=True,
                              stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        base64 = bytes.decode(ps.communicate()[0])
        out_str = f"\"{piece_label}\": \"" + "data:image/svg+xml;base64," + base64 + "\","

        print(out_str)
