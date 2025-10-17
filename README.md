# Mendix CTF 2025 - Community Archive

A community-maintained archive of the original Mendix CTF 2025 challenge portal, preserving challenge data and workshop recordings for educational purposes.

## 🎯 Features

- **26 CTF challenges** across three difficulty categories
- **17 workshop recordings** from security experts
- **Interactive hints system** with spoiler protection
- **Community write-ups** and solutions
- **Responsive design** for desktop and mobile

## 📁 Structure

```
mendixctf25/
├── index.html              # Challenge portal
├── recordings.html         # Workshop recordings
├── assets/css/style.css    # Shared styles (24KB)
├── assets/js/app.js        # Application logic
└── resources/
    ├── data/challenges.json # Challenge data & write-ups
    └── files/              # Challenge files (.mpk, .txt, .png, .zip)
```

## 🎮 Challenge Categories

| Category | Challenges | Points | Difficulty |
|----------|------------|--------|------------|
| 🍕 Pizza Mario | 19 | 106-387 | Beginner → Medium |
| 🏥 Patient Portal | 6 | 317-498 | Hard → Insane |
| ✨ Magic | 3 | 489-500 | Expert |

*Lower points = easier (more teams solved them)*

## � Workshop Recordings

**17 sessions** covering security topics from hacking basics to advanced Mendix vulnerabilities.

**Access:** Click "📹 Workshop Recordings" in the main navigation.

**Topics include:** SAML security, API vulnerabilities, file upload risks, authentication bypasses, and more.

## 🚀 Quick Start

1. **Clone:** `git clone https://github.com/jopterhorst/mendixctf25.git`
2. **Serve:** Open `index.html` or run `python -m http.server 8000`
3. **Browse:** Navigate challenges, watch recordings, use hints system

## 🔍 Key Features

- **Search & Filter:** Find challenges by keyword or category
- **Progressive Hints:** Click-to-reveal hints that auto-hide after 5 seconds  
- **Deep Linking:** Direct URLs to specific challenges
- **Write-ups:** Community solutions with detailed explanations
- **No Dependencies:** Pure HTML/CSS/JS for maximum compatibility

## 🤝 Contributing

### Add Write-ups
Edit `resources/data/challenges.json` and add to the `writeups` array:

```json
"writeups": [{
  "title": "Your Write-up Title",
  "author": "Your Name", 
  "url": "https://your-writeup-url.com",
  "platform": "Medium/Blog/GitHub"
}]
```

### Guidelines
- Detailed vulnerability explanations
- Educational context and learning value
- Credit original challenge creators

## ⚠️ Important Notes

- **Community archive** - not officially affiliated with Mendix
- **Educational purpose** - for learning web application security
- **Challenge environments** may no longer be active
- **Workshop recordings** hosted on Mendix video platform

## 📚 Learning Resources

Perfect for:
- Security researchers studying Mendix vulnerabilities
- Students learning web application security
- CTF participants preparing for competitions
- Developers understanding secure coding practices

---

**🎓 Learn. Practice. Share.**

*Community archive maintained since October 2025*

## 🎮 Challenge Categories

### 🍕 Pizza Mario - Beginner to Medium
*19 challenges ranging from Easy to Very Hard*

Focuses on web application security fundamentals including:
- Parameter manipulation
- Authentication bypasses
- Time-based attacks
- API exploitation
- Business logic flaws

**Point Range:** 106-387 points *(Lower points = easier challenges)*

### 🏥 Patient Portal - Hard to Insane
*6 challenges for advanced players*

Advanced security concepts including:
- Complex authentication mechanisms
- API security
- Data exfiltration
- Access control bypasses
- Advanced injection techniques

**Point Range:** 317-498 points *(Higher points = fewer teams solved them)*

### ✨ Magic
*3 high-level challenges*

Expert-level challenges featuring:
- SAML authentication vulnerabilities
- Advanced bypass techniques
- Complex security analysis

**Point Range:** 489-500 points *(Highest points = most difficult)*

## 🏆 Scoring System

The point values shown represent the **final scores** after the CTF 2025 event concluded. The scoring works as follows:

- **Lower Points = Easier Challenges**: More teams found the flag, so points were lower
- **Higher Points = Harder Challenges**: Fewer teams solved them, so points remained higher
- **Challenges are sorted** from easiest to hardest within each category based on final point values

This dynamic scoring system means that the final point values reflect the actual difficulty experienced by participants during the event.

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Basic understanding of web security concepts
- Access to the challenge environments:
  - Pizza Mario: `https://pizzamario2025.mendixctf.com`
  - Patient Portal: `https://patientportal2025.mendixctf.com`
  - SAML: `https://saml2025.mendixctf.com`

### Running Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/jopterhorst/mendixctf25.git
   cd mendixctf25
   ```

2. Open `index.html` in your web browser or serve it using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. Navigate to `http://localhost:8000` to access the challenge portal

## 🔍 Features

- **Search Functionality**: Search challenges by name, description, or keywords
- **Category Filtering**: Filter challenges by category (Pizza Mario, Patient Portal, Magic)
- **Challenge Details**: Click on any challenge to view detailed information including:
  - Challenge description
  - Difficulty level and point value
  - Required files and resources
  - Connection information
  - Hints (when available)
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Keyboard Navigation**: Press `/` to quickly focus the search bar

## 📁 Challenge Files

The `resources/files/` directory contains various file types needed for challenges:

- **`.mpk` files**: Mendix package files for analysis
- **`.txt` files**: Token examples and configuration files
- **`.png` files**: Screenshots and visual evidence
- **`.zip` files**: Compressed resource archives

## 🎯 Challenge Solving Tips

1. **Start with easier challenges** in the Pizza Mario category to build familiarity
2. **Read challenge descriptions carefully** - they often contain important hints
3. **Download and analyze provided files** - many contain crucial information
4. **Use browser developer tools** to inspect network traffic and page behavior
5. **Consider the Mendix platform specifics** when approaching challenges

## 🤝 Contributing

This is a **community-driven archive project**. We encourage contributions to help preserve CTF knowledge:

### How to Contribute:
- **Add write-ups**: Share detailed solutions and explanations for challenges
- **Improve documentation**: Enhance challenge descriptions and hints
- **Report issues**: Help identify problems with the archived content
- **Share insights**: Add analysis of Mendix-specific vulnerabilities and techniques
- **Educational content**: Create tutorials based on the challenges

### Write-up Guidelines:
- Wait until after the official CTF concludes before sharing solutions
- Include detailed explanations of vulnerabilities and exploitation techniques
- Provide educational context for learning purposes
- Respect the original challenge creators' work

## 📚 Educational Purpose

This archive serves as a learning resource for:
- **Security researchers** studying Mendix-specific vulnerabilities
- **Students** learning web application security
- **CTF participants** preparing for future competitions
- **Developers** understanding secure coding practices in Mendix

## 📋 Challenge Status

| Category | Total Challenges | Point Range | Difficulty |
|----------|------------------|-------------|------------|
| Pizza Mario | 19 | 106-387 | Beginner → Medium |
| Patient Portal | 6 | 317-498 | Hard → Insane |
| Magic | 3 | 489-500 | Expert Level |

*Note: Lower points indicate easier challenges (more teams solved them)*

## ⚠️ Important Notice

**This is a community-maintained archive** and is not the official Mendix CTF website. 

### About This Project:
- **Source**: This is a copy of the original Mendix CTF 2025 challenge portal
- **Purpose**: Community preservation of challenge data for educational use
- **Status**: Archive project for post-CTF learning and write-ups
- **Affiliation**: Not officially affiliated with Mendix or the original CTF organizers

### Original CTF Information:
- The original Mendix CTF 2025 was organized by the official Mendix team
- Challenge environments may no longer be accessible
- This archive preserves the challenge descriptions, files, and metadata

## 📝 License & Usage

This project is intended for **educational purposes only**:
- Use for learning web application security concepts
- Study Mendix-specific vulnerabilities and techniques
- Share knowledge through write-ups and solutions
- Respect the original challenge creators' intellectual property

**Please note**: Challenge environments referenced in the connection info may no longer be active.

---

**Learning Never Stops! 🚀**

*Community archive maintained since October 2025*

*Original Mendix CTF 2025 organized by the Mendix team*