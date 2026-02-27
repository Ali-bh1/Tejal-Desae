import urllib.request
import re

url = "https://thejamiesea.com/"
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    html = response.read().decode('utf-8')
    
    # Extract style tags or CSS links
    print("Found HTML of length:", len(html))
    
    # Let's find some common color hexes used in the <style> or anywhere
    colors = set(re.findall(r'#([0-9a-fA-F]{3,6})\b', html))
    
    print("Extracted HEX colors:", [f"#{c}" for c in colors if len(c) in (3, 6)])
    
except Exception as e:
    print("Error:", e)
