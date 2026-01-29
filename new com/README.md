# Personal Website with Real-Time Schedule Collaboration

A modern, responsive personal website with real-time collaborative schedule editing functionality.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-Time Collaboration**: Multiple users can edit the schedule simultaneously
- **Live Updates**: Changes are instantly visible to all connected users
- **Schedule Management**: Interactive weekly schedule with different activity types
- **Contact Form**: Functional contact form with validation
- **Modern UI**: Clean, professional design with smooth animations

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-Time**: WebSocket connection for live updates
- **Hosting**: GitHub Pages
- **Backend**: Firebase Realtime Database (for real-time sync)

## Live Demo

Visit the live website: [Your GitHub Pages URL will be here]

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Open `index.html` in your browser or use a local server:
```bash
python -m http.server 8000
# or
npx serve .
```

3. Visit `http://localhost:8000`

## Real-Time Collaboration Setup

The website uses Firebase Realtime Database for real-time schedule synchronization:

1. Multiple users can access the website simultaneously
2. When one user edits the schedule, changes are instantly pushed to Firebase
3. All other connected users receive the updates in real-time
4. No page refresh needed - changes appear immediately

## Schedule Editing

- Click "የሳምንቱን ፕሮግራሞች ማስተካከያ" (Edit Weekly Schedule) button
- Click on any time slot to edit the activity
- Changes are automatically saved and synchronized across all users
- Different activity types are color-coded for easy visualization

## Deployment

This website is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the real-time functionality
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).