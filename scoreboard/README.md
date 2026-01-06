# Volleyball Scoreboard for OBS

A split-screen volleyball scoreboard system designed for OBS streaming. The scoreboard display and control panel are separated for clean broadcasting.

## 📁 Files

- **display.html** - The scoreboard display (use this in OBS)
- **display.js** - Display page logic
- **control.html** - The control panel (use this in your browser)
- **control.js** - Control panel logic
- **style.css** - Your existing styles
- **Images** - All your existing images (scorevolley.001.png, vol.001.png, etc.)

## 🚀 Setup Instructions

### 1. Upload to GitHub Pages

1. Create a new repository on GitHub (or use an existing one)
2. Upload ALL files to your repository:
   - display.html
   - display.js
   - control.html
   - control.js
   - style.css
   - All your image files (.png files)
   - Font files (lemur_bold-webfont.woff2, etc.)

3. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Source: Deploy from a branch
   - Branch: main (or master) / root
   - Save

4. Your site will be available at: `https://yourusername.github.io/repository-name/`

### 2. OBS Setup

1. In OBS, add a new **Browser Source**
2. Set the URL to: `https://yourusername.github.io/repository-name/display.html`
3. Set width: **1920** and height: **1080** (or match your canvas size)
4. Check these options:
   - ✅ Shutdown source when not visible
   - ✅ Refresh browser when scene becomes active
5. Click OK

### 3. Control Panel Usage

1. Open in your browser: `https://yourusername.github.io/repository-name/control.html`
2. Use the buttons to control the scoreboard
3. The OBS display will update automatically!

## 🎮 How It Works

The system uses **localStorage** to communicate between pages:

- **Control Panel** (control.html) → Updates localStorage when you click buttons
- **Display Page** (display.html) → Reads localStorage and updates the scoreboard

Both pages must be from the **same domain** (your GitHub Pages URL) for localStorage to work.

## 💡 Important Notes

### ✅ DO's
- Keep both pages open from the SAME GitHub Pages URL
- Test the control panel in your browser before going live
- Refresh OBS Browser Source if it doesn't update immediately

### ❌ DON'Ts
- Don't open control panel from your computer (file://) and display from GitHub Pages
- Don't use different domains for control and display
- Don't close the control panel while streaming (keep it in a background tab)

## 🔧 Testing Locally

To test on your computer before uploading:

1. Use a local web server (not file://)
   - Python: `python -m http.server 8000`
   - Node.js: `npx http-server`
   - VS Code: Use Live Server extension

2. Open both pages:
   - Display: `http://localhost:8000/display.html`
   - Control: `http://localhost:8000/control.html`

3. Test that changes in control panel update the display

## 🎨 Customization

You can modify:
- Team colors (in control panel)
- Team logos (paste image URLs in control panel)
- Team names (in control panel)
- CSS styling (edit style.css)

## 🆘 Troubleshooting

**Display not updating?**
- Make sure both pages are from the same domain
- Check browser console for errors (F12)
- Try refreshing the OBS Browser Source

**Images not showing?**
- Verify all image files are uploaded to GitHub
- Check image paths in HTML are correct
- Use browser console to see 404 errors

**localStorage not working?**
- Some browsers block localStorage in certain modes
- Don't use "file://" URLs - always use http:// or https://

## 📱 Mobile Control

The control panel works on mobile browsers too! Just open the control.html URL on your phone while streaming.

## 🎯 Features

- ✅ Real-time score updates
- ✅ Set tracking
- ✅ Serve indicator (ball icon)
- ✅ Set point / Match point indicators
- ✅ Timeout indicators
- ✅ Challenge indicators
- ✅ Substitution display with player names/numbers
- ✅ Custom team colors
- ✅ Custom team logos
- ✅ Clean separation of display and controls

## 📄 License

Free to use and modify for your streaming needs!
