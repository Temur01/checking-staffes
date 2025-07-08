# Face Verification - Staff Identification System

A desktop application built with Electron for face-based staff identification and monitoring. This application provides secure access control through facial recognition technology.

## 🚀 Features

- **Face Recognition**: Real-time facial identification using webcam
- **Staff Monitoring**: Track entry and exit times of staff members
- **Kiosk Mode**: Full-screen application with restricted access
- **Version Control**: Automatic version checking and update notifications
- **Multi-platform Support**: Windows, macOS, and Linux compatibility
- **Network Security**: MAC address verification for network security
- **User-friendly Interface**: Intuitive UI with status indicators and instructions

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
- Webcam access for face recognition
- Internet connection for API communication

## 🛠️ Installation

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd checking-staffes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Generate application icons**
   ```bash
   npm run generate-icons
   ```

The built application will be available in the `dist` folder.

## 🎯 Usage

### Starting the Application

1. Run the application using `npm start`
2. The application will start in full-screen kiosk mode
3. Grant camera permissions when prompted
4. Follow the on-screen instructions for face recognition

### Face Recognition Process

1. **Position your face** in the camera frame
2. **Ensure adequate lighting** for optimal recognition
3. **Remove glasses or obstructions** if needed
4. **Click "Kirish" (Enter)** to start the recognition process
5. **Wait for verification** - the system will process your face
6. **View results** - successful identification will show your entry/exit status

### Alternative Access

- **"Boshqa odam" (Other Person)**: Use this option if you're not the primary user
- **"Qayta urinish" (Retry)**: Restart the face recognition process if needed

## 🔧 Configuration

### API Configuration

The application connects to the Argos monitoring API:
- **API URL**: `https://nazorat.argos.uz/api`
- **Version Check**: Automatic version verification
- **MAC Address**: Network interface verification

### Application Settings

- **Window Mode**: Full-screen kiosk mode
- **Security**: Disabled keyboard shortcuts (Alt+F4, F11, Escape, etc.)
- **Always On Top**: Application stays in foreground
- **No Minimize/Maximize**: Restricted window controls

## 📁 Project Structure

```
checking-staffes/
├── src/
│   ├── main.js              # Main Electron process
│   ├── preload.js           # Preload script for security
│   ├── faceid.html          # Main application interface
│   ├── style/
│   │   └── faceid.css       # Application styles
│   └── asset/               # Application assets
├── assets/
│   └── logo_project.ico     # Application icon
├── build/                   # Build configuration
├── dist/                    # Distribution files
├── package.json             # Project configuration
├── electron-builder.yml     # Electron builder config
└── build.js                 # Build script
```

## 🛡️ Security Features

- **Context Isolation**: Secure communication between main and renderer processes
- **Network Verification**: MAC address validation
- **Version Control**: Prevents outdated versions from running
- **Kiosk Mode**: Prevents user access to system controls
- **API Authentication**: Secure communication with backend services

## 🔄 Development

### Available Scripts

- `npm start` - Start the application in development mode
- `npm run build` - Build the application for distribution
- `npm run generate-icons` - Generate application icons
- `npm run prepare` - Set up Husky git hooks

### Code Quality

- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality
- **Lint-staged**: Pre-commit linting

## 📦 Dependencies

### Production Dependencies
- `axios` - HTTP client for API communication
- `form-data` - Form data handling

### Development Dependencies
- `electron` - Desktop application framework
- `electron-builder` - Application packaging
- `electron-icon-builder` - Icon generation
- `fs-extra` - Enhanced file system operations
- `husky` - Git hooks
- `lint-staged` - Pre-commit linting
- `prettier` - Code formatting

## 🌐 API Integration

The application integrates with the Argos monitoring system:

- **Version Check**: `/api/check-version/{version}`
- **Face Verification**: Real-time facial recognition
- **Staff Monitoring**: Entry/exit time tracking
- **Network Security**: MAC address verification

## 🚨 Troubleshooting

### Common Issues

1. **Camera not working**
   - Check camera permissions
   - Ensure no other applications are using the camera
   - Restart the application

2. **Face recognition fails**
   - Ensure adequate lighting
   - Remove glasses or face coverings
   - Position face in the center of the frame

3. **Application won't start**
   - Check Node.js version
   - Verify all dependencies are installed
   - Check for version compatibility

4. **Network issues**
   - Verify internet connection
   - Check API endpoint accessibility
   - Ensure MAC address is properly configured


**Note**: This application is designed for internal use and requires proper network configuration and API access to function correctly. 