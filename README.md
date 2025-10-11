# Mendix CTF 2025 - Challenges Portal

A web-based challenge browser for the Mendix Capture The Flag 2025 competition. This project provides an interactive interface to explore, filter, and solve various cybersecurity challenges across different difficulty levels.

## 🎯 Overview

This portal serves as a comprehensive hub for Mendix CTF 2025 challenges, featuring:

- **26 unique challenges** across three main categories
- Interactive challenge browser with search and filtering capabilities
- Detailed challenge information including files, hints, and connection details
- Responsive design optimized for desktop and mobile devices

## 🏗️ Project Structure

```
mendixctf25/
├── index.html              # Main application page
├── assets/
│   ├── css/
│   │   └── style.css       # Application styles
│   └── js/
│       └── app.js          # Application logic
└── resources/
    ├── data/
    │   └── challenges.json  # Challenge data and metadata
    └── files/               # Challenge-related files
        ├── *.mpk           # Mendix package files
        ├── *.txt           # Token and text files
        ├── *.png           # Screenshot evidence
        └── *.zip           # Resource archives
```

## 🎮 Challenge Categories

### 🍕 Pizza Mario - Beginner to Medium
*19 challenges ranging from Easy to Very Hard*

Focuses on web application security fundamentals including:
- Parameter manipulation
- Authentication bypasses
- Time-based attacks
- API exploitation
- Business logic flaws

**Difficulty Range:** 106-387 points

### 🏥 Patient Portal - Hard to Insane
*6 challenges for advanced players*

Advanced security concepts including:
- Complex authentication mechanisms
- API security
- Data exfiltration
- Access control bypasses
- Advanced injection techniques

**Difficulty Range:** 317-498 points

### ✨ Magic
*3 high-level challenges*

Expert-level challenges featuring:
- SAML authentication vulnerabilities
- Advanced bypass techniques
- Complex security analysis

**Difficulty Range:** 489-500 points

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

This is a community-driven project. Feel free to:

- Report issues or bugs
- Suggest improvements
- Add challenge write-ups or solutions (after the CTF ends)
- Improve the user interface or add new features

## 📋 Challenge Status

| Category | Total Challenges | Points Range | Status |
|----------|------------------|--------------|---------|
| Pizza Mario | 19 | 106-387 | ✅ Active |
| Patient Portal | 6 | 317-498 | ✅ Active |
| Magic | 3 | 489-500 | ✅ Active |

## ⚠️ Disclaimer

This project is not officially affiliated with Mendix or the official Mendix CTF. It is a community-driven initiative designed to provide an enhanced user experience for CTF participants.

## 📝 License

This project is intended for educational and competition purposes only. Please respect the CTF rules and guidelines when participating.

---

**Happy Hacking! 🚀**

*Last updated: October 2025*