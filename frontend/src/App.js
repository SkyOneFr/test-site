import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [currentSection, setCurrentSection] = useState('home');
  const [events, setEvents] = useState([]);
  const [reservationForm, setReservationForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    party_size: 1,
    special_requests: ''
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/events`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(''), 5000);
  };

  const handleReservation = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationForm),
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Réservation confirmée ! Nous vous avons envoyé un email de confirmation.');
        setReservationForm({
          name: '',
          email: '',
          phone: '',
          date: '',
          time: '',
          party_size: 1,
          special_requests: ''
        });
      } else {
        showMessage('Erreur lors de la réservation. Veuillez réessayer.', 'error');
      }
    } catch (error) {
      showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Merci pour votre inscription à notre newsletter !');
        setNewsletterEmail('');
      }
    } catch (error) {
      showMessage('Erreur lors de l\'inscription.', 'error');
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();
      if (data.success) {
        showMessage('Votre message a été envoyé ! Nous vous répondrons rapidement.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (error) {
      showMessage('Erreur lors de l\'envoi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const Navigation = () => (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 py-4">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-amber-500">L'envers</div>
        <div className="hidden md:flex space-x-8">
          {['home', 'about', 'events', 'reservation', 'contact'].map((section) => (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`text-white hover:text-amber-500 transition-colors ${
                currentSection === section ? 'text-amber-500' : ''
              }`}
            >
              {section === 'home' ? 'Accueil' : 
               section === 'about' ? 'À propos' :
               section === 'events' ? 'Événements' :
               section === 'reservation' ? 'Réserver' : 'Contact'}
            </button>
          ))}
        </div>
        <div className="md:hidden">
          <button className="text-white">☰</button>
        </div>
      </div>
    </nav>
  );

  const HomePage = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="h-screen bg-cover bg-center relative flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url('https://images.unsplash.com/photo-1636067518443-4c59b8e80e43?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxhbHRlcm5hdGl2ZSUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2MzB8MA&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">L'envers</h1>
          <p className="text-2xl md:text-3xl mb-8 text-amber-300">
            Bar alternatif & culturel au cœur d'Aubagne
          </p>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Un lieu unique où se mélangent ambiance conviviale, culture alternative et art local. 
            Venez découvrir l'envers du décor !
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button 
              onClick={() => setCurrentSection('reservation')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Réserver une table
            </button>
            <button 
              onClick={() => setCurrentSection('events')}
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Voir les événements
            </button>
            <button 
              onClick={() => setCurrentSection('about')}
              className="border-2 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Découvrir le lieu
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Pourquoi L'envers ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-6xl mb-6">🎭</div>
              <h3 className="text-2xl font-bold text-amber-500 mb-4">Culture & Art</h3>
              <p className="text-gray-300">
                Concerts, expositions, soirées thématiques... Un programme culturel riche et varié.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-6">🍹</div>
              <h3 className="text-2xl font-bold text-amber-500 mb-4">Bar d'Excellence</h3>
              <p className="text-gray-300">
                Cocktails créatifs, bières artisanales et produits locaux dans une ambiance unique.
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-6">🤝</div>
              <h3 className="text-2xl font-bold text-amber-500 mb-4">Lieu Collaboratif</h3>
              <p className="text-gray-300">
                Privatisation possible pour vos événements privés, anniversaires ou soirées d'entreprise.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const AboutPage = () => (
    <div className="pt-20 min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-16 text-amber-500">À propos de L'envers</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
            <p className="text-lg mb-6 leading-relaxed">
              Né de la passion pour la culture alternative et l'art local, L'envers est plus qu'un simple bar. 
              C'est un lieu de rencontre, d'échange et de découverte au cœur d'Aubagne.
            </p>
            <p className="text-lg mb-6 leading-relaxed">
              Notre nom "L'envers" symbolise notre approche : montrer l'autre face des choses, 
              celle qui sort des sentiers battus, celle qui surprend et qui rassemble.
            </p>
            <p className="text-lg leading-relaxed">
              Depuis notre ouverture, nous nous engageons à soutenir les artistes locaux, 
              à proposer des produits de qualité et à créer une ambiance chaleureuse et inclusive.
            </p>
          </div>
          <div 
            className="rounded-lg bg-cover bg-center h-96"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1600007525237-3ffb936cd20f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2NDd8MA&ixlib=rb-4.1.0&q=85')`
            }}
          ></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-amber-500">Nos Valeurs</h3>
            <ul className="space-y-3 text-lg">
              <li>✨ <strong>Authenticité</strong> - Une ambiance vraie et naturelle</li>
              <li>🎨 <strong>Créativité</strong> - Soutien aux artistes et à l'innovation</li>
              <li>🌱 <strong>Local</strong> - Produits régionaux et circuit court</li>
              <li>🤲 <strong>Convivialité</strong> - Un accueil chaleureux pour tous</li>
              <li>🎭 <strong>Culture</strong> - Programmation riche et diversifiée</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4 text-amber-500">Nos Espaces</h3>
            <ul className="space-y-3 text-lg">
              <li>🍺 <strong>Bar principal</strong> - 40 places assises</li>
              <li>🎤 <strong>Scène</strong> - Pour concerts et spectacles</li>
              <li>🌿 <strong>Terrasse</strong> - 30 places en extérieur</li>
              <li>🖼️ <strong>Galerie</strong> - Expositions d'artistes locaux</li>
              <li>🎉 <strong>Salon privé</strong> - Pour événements sur mesure</li>
            </ul>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            className="h-64 bg-cover bg-center rounded-lg"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1636067661623-50c011a09767?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxhbHRlcm5hdGl2ZSUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2MzB8MA&ixlib=rb-4.1.0&q=85')`
            }}
          ></div>
          <div 
            className="h-64 bg-cover bg-center rounded-lg"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1571950006119-9f047f9d27b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwyfHxhcnRpc3RpYyUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2NDd8MA&ixlib=rb-4.1.0&q=85')`
            }}
          ></div>
          <div 
            className="h-64 bg-cover bg-center rounded-lg"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1636067017589-269088431994?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxhbHRlcm5hdGl2ZSUyMGJhcnxlbnwwfHx8fDE3NTI5MTc2MzB8MA&ixlib=rb-4.1.0&q=85')`
            }}
          ></div>
        </div>
      </div>
    </div>
  );

  const EventsPage = () => (
    <div className="pt-20 min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-16 text-amber-500">Nos Événements</h1>
        
        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400 mb-8">Chargement des événements...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform">
                {event.image_url && (
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url('${event.image_url}')` }}
                  ></div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm">
                      {event.category}
                    </span>
                    <span className="text-amber-500 font-bold">{event.price}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-gray-400 mb-4">{event.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>📅 {new Date(event.date).toLocaleDateString('fr-FR')}</span>
                    <span>🕐 {event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-16">
          <p className="text-lg text-gray-400 mb-8">
            Restez informés de tous nos événements en vous inscrivant à notre newsletter !
          </p>
          <form onSubmit={handleNewsletter} className="flex max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Votre email..."
              className="flex-1 px-4 py-2 rounded-l-lg bg-gray-800 text-white border border-gray-700"
              required
            />
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-r-lg font-semibold transition-colors"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const ReservationPage = () => (
    <div className="pt-20 min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-16 text-amber-500">Réservation</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Réserver votre table</h2>
            <p className="text-lg mb-8 text-gray-300">
              Réservez votre table pour profiter pleinement de l'ambiance unique de L'envers. 
              Que ce soit pour un verre entre amis ou un événement spécial, nous vous accueillons dans les meilleures conditions.
            </p>
            
            <div className="space-y-4 text-gray-300">
              <div className="flex items-center">
                <span className="text-amber-500 mr-3">📍</span>
                <span>123 Rue de la République, 13400 Aubagne</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500 mr-3">📞</span>
                <span>04 42 XX XX XX</span>
              </div>
              <div className="flex items-center">
                <span className="text-amber-500 mr-3">🕐</span>
                <span>Mardi-Samedi : 17h-2h | Dimanche : 17h-1h</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleReservation} className="bg-gray-800 p-8 rounded-lg">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Nom *</label>
                <input
                  type="text"
                  value={reservationForm.name}
                  onChange={(e) => setReservationForm({...reservationForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={reservationForm.email}
                  onChange={(e) => setReservationForm({...reservationForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={reservationForm.phone}
                  onChange={(e) => setReservationForm({...reservationForm, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Date *</label>
                  <input
                    type="date"
                    value={reservationForm.date}
                    onChange={(e) => setReservationForm({...reservationForm, date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Heure *</label>
                  <select
                    value={reservationForm.time}
                    onChange={(e) => setReservationForm({...reservationForm, time: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                    required
                  >
                    <option value="">Choisir...</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                    <option value="18:00">18:00</option>
                    <option value="18:30">18:30</option>
                    <option value="19:00">19:00</option>
                    <option value="19:30">19:30</option>
                    <option value="20:00">20:00</option>
                    <option value="20:30">20:30</option>
                    <option value="21:00">21:00</option>
                    <option value="21:30">21:30</option>
                    <option value="22:00">22:00</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Nombre de personnes *</label>
                <select
                  value={reservationForm.party_size}
                  onChange={(e) => setReservationForm({...reservationForm, party_size: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none"
                  required
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} personne{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Demandes spéciales</label>
                <textarea
                  value={reservationForm.special_requests}
                  onChange={(e) => setReservationForm({...reservationForm, special_requests: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-amber-500 focus:outline-none h-24 resize-none"
                  placeholder="Allergies, anniversaire, demandes particulières..."
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Privatization Section */}
        <div className="mt-16 bg-gray-800 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-amber-500">Privatisation</h2>
          <p className="text-lg text-gray-300 mb-6">
            Vous souhaitez privatiser L'envers pour un événement spécial ? 
            Anniversaires, soirées d'entreprise, lancements de produit... nous nous adaptons à vos besoins.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-bold text-amber-500">Événements privés</h3>
              <p className="text-sm text-gray-400">Anniversaires, célébrations</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-bold text-amber-500">Entreprises</h3>
              <p className="text-sm text-gray-400">Séminaires, team building</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-bold text-amber-500">Événements culturels</h3>
              <p className="text-sm text-gray-400">Vernissages, conférences</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={() => setCurrentSection('contact')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Demander un devis
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ContactPage = () => (
    <div className="pt-20 min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-16 text-amber-500">Contact</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-8">Infos pratiques</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-amber-500 mb-3">📍 Adresse</h3>
                <p className="text-lg">123 Rue de la République<br/>13400 Aubagne, France</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-amber-500 mb-3">🕐 Horaires</h3>
                <div className="space-y-2">
                  <p>Mardi - Jeudi : 17h00 - 1h00</p>
                  <p>Vendredi - Samedi : 17h00 - 2h00</p>
                  <p>Dimanche : 17h00 - 1h00</p>
                  <p className="text-gray-400">Fermé le lundi</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-amber-500 mb-3">📞 Contact</h3>
                <p>Téléphone : 04 42 XX XX XX</p>
                <p>Email : contact@lenvers-aubagne.fr</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-amber-500 mb-3">🚗 Accès</h3>
                <p>Parking public Place Joseph Fallen (2 min à pied)</p>
                <p>Bus ligne 1, arrêt République</p>
                <p>Gare SNCF d'Aubagne (10 min à pied)</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-amber-500 mb-3">📱 Réseaux sociaux</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-amber-600 transition-colors">📘 Facebook</a>
                  <a href="#" className="bg-gray-800 p-3 rounded-lg hover:bg-amber-600 transition-colors">📷 Instagram</a>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-8">Nous contacter</h2>
            <form onSubmit={handleContact} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Nom *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Sujet *</label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
                  required
                >
                  <option value="">Choisir un sujet...</option>
                  <option value="Réservation">Réservation</option>
                  <option value="Privatisation">Privatisation</option>
                  <option value="Événement">Proposer un événement</option>
                  <option value="Partenariat">Partenariat</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2">Message *</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none h-32 resize-none"
                  placeholder="Votre message..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Map placeholder */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Plan d'accès</h2>
          <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-xl text-gray-400">Carte interactive Google Maps</p>
              <p className="text-sm text-gray-500 mt-2">(Intégration à venir avec la clé API)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'home': return <HomePage />;
      case 'about': return <AboutPage />;
      case 'events': return <EventsPage />;
      case 'reservation': return <ReservationPage />;
      case 'contact': return <ContactPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <Navigation />
      
      {/* Message notification */}
      {message && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg text-white font-semibold ${
          message.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {message.text}
        </div>
      )}
      
      {renderCurrentSection()}
      
      {/* Footer */}
      <footer className="bg-black py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-3xl font-bold text-amber-500 mb-6">L'envers</div>
          <p className="text-gray-400 mb-6">Bar alternatif & culturel - Aubagne</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>© 2025 L'envers</span>
            <span>|</span>
            <a href="#" className="hover:text-amber-500">Mentions légales</a>
            <span>|</span>
            <a href="#" className="hover:text-amber-500">Politique de confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;