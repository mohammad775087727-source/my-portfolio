import { useState, useEffect } from 'react';
import { Linkedin, Instagram, Mail, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [contactData, setContactData] = useState({ sender_name: '', sender_contact: '', message_text: '' });
  const [contactStatus, setContactStatus] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const navigate = useNavigate();
  const [secretClicks, setSecretClicks] = useState(0);

  const handleSecretClick = () => {
    setSecretClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        navigate('/admin/login');
        return 0;
      }
      return newCount;
    });
  };

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).catch(console.error);
    api.get('/settings').then(res => {
      const nameSetting = res.data.find(s => s.key === 'profile_name');
      if (nameSetting) setProfileName(nameSetting.value);
      
      const picSetting = res.data.find(s => s.key === 'profile_picture');
      if (picSetting) setProfilePictureUrl(`http://127.0.0.1:8000${picSetting.value}`);

      const waSetting = res.data.find(s => s.key === 'whatsapp_link');
      if (waSetting) setWhatsappLink(waSetting.value);

      const instaSetting = res.data.find(s => s.key === 'instagram_link');
      if (instaSetting) setInstagramLink(instaSetting.value);

      const linkSetting = res.data.find(s => s.key === 'linkedin_link');
      if (linkSetting) setLinkedinLink(linkSetting.value);
    }).catch(console.error);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact', contactData);
      setContactStatus('success');
      setContactData({ sender_name: '', sender_contact: '', message_text: '' });
      setTimeout(() => setContactStatus(null), 3000);
    } catch (err) {
      setContactStatus('error');
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
        <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 p-1 mb-6 shadow-2xl shadow-blue-500/20">
          <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
             {profilePictureUrl ? (
               <img src={profilePictureUrl} alt="الصورة الشخصية" className="w-full h-full object-cover select-none cursor-default" onClick={handleSecretClick} />
             ) : (
               <div className="text-4xl text-gray-700 font-bold select-none cursor-default" onClick={handleSecretClick}>صورة</div>
             )}
          </div>
        </div>
        
        {profileName && (
          <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-md">{profileName}</h2>
        )}

        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 leading-normal">
          مرحباً، أنا مطور برمجيات
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          أصنع تجارب رقمية مميزة وحلول برمجية مبتكرة. متخصص في بناء تطبيقات الويب الحديثة باستخدام أحدث التقنيات.
        </p>
        <div className="flex justify-center gap-6">
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="p-4 bg-gray-800 rounded-full hover:bg-green-600 hover:text-white hover:scale-110 transition-all text-green-400 shadow-lg" title="تواصل عبر الواتساب">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </a>
          )}
          {instagramLink && (
            <a href={instagramLink} target="_blank" rel="noreferrer" className="p-4 bg-gray-800 rounded-full hover:bg-pink-600 hover:text-white hover:scale-110 transition-all text-pink-400 shadow-lg" title="تابعني على انستقرام">
              <Instagram size={28} />
            </a>
          )}
          {linkedinLink && (
            <a href={linkedinLink} target="_blank" rel="noreferrer" className="p-4 bg-gray-800 rounded-full hover:bg-blue-600 hover:text-white hover:scale-110 transition-all text-blue-400 shadow-lg" title="تواصل عبر لينكد إن">
              <Linkedin size={28} />
            </a>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto bg-gray-950/50 rounded-3xl mb-24 border border-gray-800/50">
        <h2 className="text-4xl font-bold mb-16 text-center">أحدث مشاريعي</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8">
          {projects.map(project => (
              <div 
                key={project.id} 
                className="bg-gray-900 rounded-2xl overflow-hidden cursor-pointer group hover:transform hover:-translate-y-2 transition-all duration-300 border border-gray-800 hover:border-blue-500/50 shadow-xl hover:shadow-blue-500/10 flex flex-col"
                onClick={() => { setSelectedProject(project); }}
              >
              <div className="h-56 bg-gray-800 overflow-hidden relative">
                {project.images.length > 0 ? (
                  <>
                    <img src={`http://127.0.0.1:8000${project.images[0].image_path}`} alt={project.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">لا توجد صورة</div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                <p className="text-gray-400 line-clamp-3 leading-relaxed flex-1">{project.description}</p>
                <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-500 flex justify-between items-center">
                  <span>{project.images.length} صور</span>
                  <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">عرض التفاصيل ←</span>
                </div>
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className="col-span-full text-center text-gray-500 py-20 text-xl">لا توجد مشاريع مضافة حتى الآن.</div>}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 max-w-2xl mx-auto">
         <h2 className="text-4xl font-bold mb-12 text-center">لنتحدث معاً</h2>
         <form onSubmit={handleContactSubmit} className="space-y-6 bg-gray-900 p-8 md:p-12 rounded-3xl border border-gray-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-tr-full blur-3xl"></div>
            
            {contactStatus === 'success' && <div className="bg-green-500/10 text-green-400 p-4 rounded-xl text-center border border-green-500/20 mb-8 backdrop-blur-sm">تم إرسال رسالتك بنجاح! سأتواصل معك قريباً.</div>}
            {contactStatus === 'error' && <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center border border-red-500/20 mb-8 backdrop-blur-sm">حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.</div>}
            
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">الاسم الكريم</label>
              <input type="text" required value={contactData.sender_name} onChange={e => setContactData({...contactData, sender_name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="محمد أحمد..." />
            </div>
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">وسيلة التواصل (رقم أو إيميل)</label>
              <input type="text" required value={contactData.sender_contact} onChange={e => setContactData({...contactData, sender_contact: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="email@example.com" dir="ltr" />
            </div>
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">كيف يمكنني مساعدتك؟</label>
              <textarea required rows="5" value={contactData.message_text} onChange={e => setContactData({...contactData, message_text: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" placeholder="اكتب تفاصيل مشروعك أو رسالتك هنا..." />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 relative z-10 text-lg mt-4">
              إرسال الرسالة
            </button>
         </form>
      </section>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedProject(null)}></div>
          <div className="relative bg-gray-900 w-full max-w-5xl rounded-3xl overflow-hidden border border-gray-800 flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm absolute top-0 left-0 right-0 z-10">
              <h3 className="text-2xl font-bold">{selectedProject.title}</h3>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto pt-24 pb-6 px-6">
              {selectedProject.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                  {selectedProject.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="cursor-pointer overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 hover:border-blue-500 transition-all group shadow-lg aspect-video relative flex items-center justify-center"
                      onClick={() => setFullscreenImage(`http://127.0.0.1:8000${img.image_path}`)}
                    >
                      <img 
                        src={`http://127.0.0.1:8000${img.image_path}`} 
                        alt={`صورة المشروع ${idx + 1}`} 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-gray-900/80 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-700 shadow-xl">عرض بحجم أكبر</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="max-w-3xl mx-auto mb-8 bg-gray-800/30 p-8 rounded-2xl border border-gray-800/50">
                <h4 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">تفاصيل المشروع</h4>
                <p className="text-gray-300 leading-loose whitespace-pre-line text-lg">{selectedProject.description}</p>
              </div>
              
              {selectedProject.demo_link && (
                <div className="text-center">
                  <a href={selectedProject.demo_link} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1">
                    زيارة المشروع / المعاينة الحية
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setFullscreenImage(null)}>
          <button className="absolute top-6 right-6 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full p-3 transition-all z-10 shadow-lg border border-gray-700" onClick={() => setFullscreenImage(null)}>
            <X size={28} />
          </button>
          <img 
            src={fullscreenImage} 
            alt="تكبير" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-zoom-out" 
            onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }} 
          />
        </div>
      )}

    </div>
  );
}
