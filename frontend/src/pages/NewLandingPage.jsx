import { Link } from 'react-router-dom';
import { 
  Brain, 
  Zap, 
  Target, 
  Shield, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Clock,
  Award,
  Star,
  ChevronRight,
  Menu,
  X,
  Check,
  Upload,
  Search,
  UserCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-gray-200/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/25">
                  <Brain className="h-7 w-7 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight font-display">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">rest</span>
                <span className="text-gray-900">.ai</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-10">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm">Testimonials</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="hidden sm:block text-gray-700 hover:text-indigo-600 transition-colors font-semibold text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 space-y-4 border-t border-gray-200">
              <a href="#features" className="block text-gray-700 hover:text-indigo-600 font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-indigo-600 font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#pricing" className="block text-gray-700 hover:text-indigo-600 font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-indigo-600 font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 px-6 overflow-hidden">
        {/* Animated Vibrant Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>
        
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/80 to-white"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-lg shadow-gray-200/50 border border-gray-200">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-700">AI-Powered Recruitment Platform</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-gray-900 font-display">
              Hire Top Talent
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                10x Faster with AI
              </span>
            </h1>
            
            {/* Subtext */}
            <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light">
              Automate resume screening, rank candidates instantly, and generate interview kits with cutting-edge AI. 
              Reduce hiring time from weeks to days.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-base shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-base border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                See How It Works
              </a>
            </div>

            {/* Trust Indicators */}
            <p className="text-sm text-gray-500 pt-4">
              ✓ No credit card required  •  ✓ 14-day free trial  •  ✓ Cancel anytime
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16">
            {[
              { value: '95%', label: 'Match Accuracy', icon: Target, color: 'indigo' },
              { value: '10x', label: 'Faster Screening', icon: Zap, color: 'purple' },
              { value: '50k+', label: 'Resumes Analyzed', icon: FileText, color: 'pink' },
              { value: '500+', label: 'Happy Clients', icon: Users, color: 'blue' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-50 mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-16 px-6 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-8">
            Trusted by innovative companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Apple'].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-600">{company}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight font-display">
              Everything you need to
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                streamline hiring
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Powerful AI-driven features that transform your recruitment process from end to end
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Matching',
                description: 'Advanced machine learning algorithms analyze resumes and match candidates with 95% accuracy.',
                color: 'indigo'
              },
              {
                icon: Zap,
                title: 'Instant Screening',
                description: 'Process hundreds of resumes in seconds. Screen applications 10x faster than manual review.',
                color: 'purple'
              },
              {
                icon: Target,
                title: 'Smart Ranking',
                description: 'Automatically rank candidates with detailed score breakdowns and AI-generated insights.',
                color: 'pink'
              },
              {
                icon: FileText,
                title: 'Resume Parsing',
                description: 'Extract skills, experience, and education from any format with 99% accuracy. Supports PDF, DOC, DOCX.',
                color: 'blue'
              },
              {
                icon: MessageSquare,
                title: 'Interview Kits',
                description: 'Generate customized interview questions, evaluation criteria, and follow-ups for each role.',
                color: 'emerald'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Track metrics, monitor pipeline health, and make data-driven decisions with real-time insights.',
                color: 'amber'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-xl bg-${feature.color}-50 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Get started in
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                three simple steps
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              From upload to hire in minutes, not weeks
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload Resumes',
                description: 'Drag and drop candidate resumes or sync with your ATS. We support PDF, DOC, and DOCX formats.'
              },
              {
                step: '02',
                icon: Search,
                title: 'AI Analysis',
                description: 'Our AI instantly parses, analyzes, and matches candidates to your job requirements with precision.'
              },
              {
                step: '03',
                icon: UserCheck,
                title: 'Review & Hire',
                description: 'Get ranked candidates with detailed insights. Generate interview kits and make confident hiring decisions.'
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-6 border-2 border-indigo-100">
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {item.step}
                  </span>
                </div>
                
                {/* Icon */}
                <div className="inline-flex p-5 rounded-2xl bg-white shadow-lg border border-gray-200 mb-6">
                  <item.icon className="h-10 w-10 text-indigo-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{item.description}</p>

                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Value Proposition */}
      <section className="relative py-24 lg:py-32 px-6 bg-gray-50 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Transform your hiring with
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  intelligent automation
                </span>
              </h2>
              
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Stop wasting time on manual resume screening. Let AI handle the heavy lifting while you focus on what matters—finding the perfect candidate.
              </p>
              
              <div className="space-y-5">
                {[
                  { text: 'Reduce time-to-hire by 80%', icon: Clock },
                  { text: 'Eliminate unconscious bias', icon: Shield },
                  { text: 'Improve candidate quality 3x', icon: TrendingUp },
                  { text: 'Scale effortlessly', icon: Users },
                  { text: 'Save $50k+ annually', icon: Target },
                  { text: '24/7 AI support', icon: MessageSquare }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <span className="text-lg text-gray-700 font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="inline-flex items-center space-x-2 mt-10 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <div className="aspect-square bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex flex-col items-center justify-center text-white">
                  <TrendingUp className="h-32 w-32 mb-8 opacity-90" />
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-4">10,000+</div>
                    <div className="text-2xl font-semibold opacity-90">Successful Hires</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100 animate-float">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">95%</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Accuracy</div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100 animate-float-delayed">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">2min</div>
                <div className="text-sm text-gray-600 font-semibold mt-1">Avg. Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Simple, transparent
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                pricing for everyone
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'Perfect for trying out the platform',
                features: [
                  '10 resume screenings/month',
                  'Basic AI matching',
                  '5 active jobs',
                  'Email support',
                  'Standard analytics'
                ],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Professional',
                price: '$99',
                period: '/month',
                description: 'For growing teams and agencies',
                features: [
                  '500 resume screenings/month',
                  'Advanced AI matching',
                  'Unlimited jobs',
                  'Priority support',
                  'Advanced analytics',
                  'Interview kits',
                  'Team collaboration',
                  'Custom integrations'
                ],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: [
                  'Unlimited screenings',
                  'Custom AI models',
                  'Dedicated manager',
                  '24/7 phone support',
                  'Custom analytics',
                  'SSO & SAML',
                  'SLA guarantee',
                  'On-premise option'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-indigo-600 shadow-2xl scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>
                  <div className="flex items-end justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 ml-2 mb-2">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="h-5 w-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`block w-full py-4 rounded-xl font-semibold text-center transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 lg:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Loved by teams
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                around the world
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              See what our customers say about rest.ai
            </p>
          </div>

          {/* Testimonial Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "rest.ai reduced our time-to-hire by 75%. The AI matching is incredibly accurate and saves our team countless hours every week.",
                author: "Sarah Johnson",
                role: "Head of Talent",
                company: "TechCorp",
                rating: 5
              },
              {
                quote: "The interview kit generation is a game-changer. We're conducting much more structured and effective interviews now.",
                author: "Michael Chen",
                role: "Recruitment Manager",
                company: "Global Solutions",
                rating: 5
              },
              {
                quote: "Best recruitment tool we've used. The ROI was clear within the first month. Highly recommended for any growing company.",
                author: "Emily Rodriguez",
                role: "VP of HR",
                company: "StartUp Labs",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to transform
            <br />
            your hiring process?
          </h2>
          
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join thousands of companies using AI to hire smarter and faster
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-white/50 transform hover:-translate-y-1 transition-all duration-300"
            >
              Start Free 14-Day Trial
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-10 py-5 bg-transparent text-white rounded-2xl font-bold text-lg border-2 border-white/30 hover:bg-white/10 hover:border-white transition-all duration-300"
            >
              Sign In to Account
            </Link>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-2xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">rest.ai</span>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Transform your recruitment with AI-powered screening, matching, and automation. Hire smarter, not harder.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Security', 'API'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">&copy; 2025 rest.ai. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-sm hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
