# VergeAI - HOA Compliance Checker

A full-stack application that analyzes property photos against HOA (Homeowners Association) rules to check compliance.

## Features

- **HOA Rules Upload**: Upload your HOA rule documents (PDF, TXT, DOC, DOCX)
- **Photo Analysis**: Upload property photos for compliance checking
- **AI-Powered Analysis**: Uses OpenAI to analyze whether properties comply with HOA rules
- **Cloud Vision Integration**: Automatic object detection and labeling using Google Cloud Vision

## Project Structure

```
hoa-app/
├── hoa-backend/       # Express.js backend server
│   ├── index.js       # Main server file
│   ├── package.json   # Backend dependencies
│   └── key.json       # (gitignored) Google Cloud credentials
├── hoa-frontend/      # React frontend application
│   ├── src/
│   ├── package.json   # Frontend dependencies
│   └── public/
└── package.json       # Root package.json
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (from https://platform.openai.com/api-keys)
- Google Cloud Vision API credentials (JSON service account key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hoa-app.git
   cd hoa-app
   ```

2. **Install backend dependencies**
   ```bash
   cd hoa-backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../hoa-frontend
   npm install
   cd ..
   ```

### Environment Variables

1. **Backend Configuration** - Create `.env` file in `hoa-backend/`:
   ```bash
   cp hoa-backend/.env.example hoa-backend/.env
   ```
   Then edit `hoa-backend/.env` and add:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `GOOGLE_APPLICATION_CREDENTIALS` - Path to your Google Cloud service account JSON file

2. **Frontend Configuration** (optional) - Create `.env` file in `hoa-frontend/`:
   ```bash
   cp hoa-frontend/.env.example hoa-frontend/.env
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd hoa-backend
   npm start
   # Server runs on http://localhost:4000
   ```

2. **In a new terminal, start the frontend**
   ```bash
   cd hoa-frontend
   npm start
   # Application opens on http://localhost:3000
   ```

## API Endpoints

### POST `/api/upload-rules`
Upload HOA rules document (PDF, TXT, DOC, DOCX)
- **Body**: `multipart/form-data` with `rules` file

### POST `/api/analyze-openai`
Analyze property photo for compliance using OpenAI
- **Body**: `multipart/form-data` with `image` file
- **Returns**: JSON analysis of compliance

### POST `/api/analyze-vision`
Get object labels using Google Cloud Vision
- **Body**: `multipart/form-data` with `image` file
- **Returns**: Detected objects and labels

## Tech Stack

### Backend
- **Express.js** - Web server framework
- **Multer** - File upload handling
- **OpenAI API** - AI-powered analysis
- **Google Cloud Vision** - Image recognition
- **PDF-Parse** - PDF document reading
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI framework
- **Axios** - HTTP client
- **CSS** - Styling

## Disclaimer

This tool is provided for reference purposes only and should not be used as a legal document. This application is not regulated by any HOA and should not be considered official compliance verification.

## License

MIT

## Author

Sophia Liu
