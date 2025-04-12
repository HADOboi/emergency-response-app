# Emergency Response Web App

A mobile-first emergency response web application that provides quick access to emergency contacts based on the user's location.

## Features

- 🌍 Location-Based Emergency Contacts
- 📞 One-Tap Emergency Calls
- 🚨 Quick Access to Police, Hospital, and Fire Services
- 🗺️ Interactive Map with Nearby Emergency Services (using OpenStreetMap)
- 📱 Mobile & Desktop Optimized

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd emergency-response-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

- Allow location access when prompted for location-based services
- Click on emergency buttons to:
  - On mobile: Directly call emergency services
  - On desktop: View emergency contact numbers
- Use the interactive OpenStreetMap to find nearby emergency services
- Access additional emergency services through the "More Services" button

## Development

- Built with React + TypeScript
- Uses Vite for fast development
- Material-UI for components
- OpenStreetMap with Leaflet.js for mapping (free, no API key required)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
