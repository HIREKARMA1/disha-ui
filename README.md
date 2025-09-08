# HireKarma Frontend

A modern, responsive frontend application built with Next.js, TypeScript, and Tailwind CSS for the HireKarma job portal platform.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Dark/Light Mode**: Built-in theme switching with system preference detection
- **TypeScript**: Full type safety and better development experience
- **Responsive Design**: Mobile-first approach with excellent cross-device compatibility
- **Form Validation**: Robust form handling with Zod schema validation
- **Authentication**: Complete login/registration system for multiple user types
- **API Integration**: Seamless backend integration with automatic token management

## 🎨 Design System

### Color Palette

Based on the HireKarma logo:

- **Primary Blue**: `#00B0E0` - Main brand color
- **Black**: `#000000` - Primary text color
- **White**: `#FFFFFF` - Background color
- **Gray Scale**: Comprehensive gray palette for UI elements

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: Regular, Medium, Semibold, Bold
- **Responsive**: Fluid typography scaling

### Components

- **Button**: Multiple variants (default, outline, ghost, gradient)
- **Input**: Form inputs with icon support and validation states
- **Select**: Custom dropdown with search functionality
- **Card**: Flexible card components for content organization

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Theming**: next-themes
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**

   ```bash
   cd client/ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=HireKarma
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://host:3000](http://localhost:3000)

## 🏗️ Project Structure

```
client/ui/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── providers/         # Context providers
│   └── ui/               # UI components
├── lib/                   # Utility libraries
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
│   └── auth.ts           # Authentication types
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Automatic code formatting
- **Import Aliases**: Use `@/` for absolute imports

### Component Guidelines

- Use TypeScript interfaces for props
- Implement proper error handling
- Add loading states for async operations
- Use semantic HTML elements
- Ensure accessibility (ARIA labels, keyboard navigation)

## 🌐 API Integration

The frontend integrates with the HireKarma backend API:

### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register/student` - Student registration
- `POST /api/v1/auth/register/corporate` - Corporate registration
- `POST /api/v1/auth/register/university` - University registration
- `POST /api/v1/auth/register/admin` - Admin registration

### Features

- **Automatic Token Management**: JWT tokens stored securely
- **Token Refresh**: Automatic token renewal
- **Error Handling**: Comprehensive error handling with user feedback
- **Request/Response Interceptors**: Centralized API configuration

## 🎯 User Types

The application supports four main user types:

### 1. Student

- Profile creation with academic details
- Skill management and career preferences
- Job application tracking
- Resume building tools

### 2. Corporate

- Company profile management
- Job posting and management
- Candidate search and filtering
- Analytics and reporting

### 3. University

- Institution profile management
- Student placement tracking
- Industry partnerships
- Career services management

### 4. Admin

- System administration
- User management
- Platform analytics
- Content moderation

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_NAME` - Application name

### Performance Optimization

- **Image Optimization**: Next.js built-in image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Use `@next/bundle-analyzer` for optimization
- **CDN**: Configure CDN for static assets

## 🔒 Security

- **HTTPS**: Always use HTTPS in production
- **CORS**: Proper CORS configuration
- **Input Validation**: Server-side and client-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Token-based CSRF protection

## 📱 Responsive Design

- **Mobile First**: Mobile-optimized design approach
- **Breakpoints**: Tailwind CSS responsive breakpoints
- **Touch Friendly**: Optimized for touch devices
- **Performance**: Fast loading on mobile networks

## 🧪 Testing

### Unit Testing

```bash
npm run test
```

### E2E Testing

```bash
npm run test:e2e
```

### Testing Tools

- **Jest**: Unit testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **MSW**: API mocking

## 📊 Analytics

- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: User behavior analysis
- **Error Tracking**: Error monitoring and reporting
- **A/B Testing**: Feature flag management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Commit Convention

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Roadmap

### Phase 1 (Current)

- ✅ Authentication system
- ✅ User registration
- ✅ Basic UI components
- ✅ Theme system

### Phase 2 (Next)

- [ ] Dashboard implementation
- [ ] Job management system
- [ ] Profile management
- [ ] Search and filtering

### Phase 3 (Future)

- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] AI-powered matching

---

**Built with ❤️ by the HireKarma Team**
