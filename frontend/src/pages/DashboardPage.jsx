import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, Plus, Image as ImageIcon, MessageSquare, LayoutDashboard, ExternalLink, Globe, Settings } from 'lucide-react';
import api from '../api';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('projects');
  const navigate = useNavigate();

  const [profileName, setProfileName] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // New project state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
    fetchMessages();
    fetchSettings();

    // منع زر الرجوع في المتصفح
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.go(1);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      const nameSetting = res.data.find(s => s.key === 'profile_name');
      if (nameSetting) setProfileName(nameSetting.value);

      const waSetting = res.data.find(s => s.key === 'whatsapp_link');
      if (waSetting) setWhatsappLink(waSetting.value);

      const instaSetting = res.data.find(s => s.key === 'instagram_link');
      if (instaSetting) setInstagramLink(instaSetting.value);

      const linkSetting = res.data.find(s => s.key === 'linkedin_link');
      if (linkSetting) setLinkedinLink(linkSetting.value);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await api.put('/admin/settings/profile_name', { value: profileName });
      await api.put('/admin/settings/whatsapp_link', { value: whatsappLink });
      await api.put('/admin/settings/instagram_link', { value: instagramLink });
      await api.put('/admin/settings/linkedin_link', { value: linkedinLink });
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      alert('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleUploadProfilePicture = async (e) => {
    e.preventDefault();
    if (!profilePicture) return alert('يرجى اختيار صورة أولاً');
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', profilePicture);
    
    try {
      await api.post('/admin/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('تم تحديث الصورة الشخصية بنجاح!');
      setProfilePicture(null);
    } catch (err) {
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) return alert('يرجى تعبئة جميع الحقول');
    if (adminPassword.length < 6) return alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setIsSavingCreds(true);
    try {
      await api.put('/admin/credentials', { username: adminUsername, password: adminPassword });
      alert('تم تحديث بيانات الدخول بنجاح! يرجى تسجيل الدخول مجدداً بالبيانات الجديدة.');
      handleLogout();
    } catch (err) {
      alert('حدث خطأ أثناء تحديث بيانات الدخول');
    } finally {
      setIsSavingCreds(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get('/admin/messages');
      setMessages(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/login');
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (images.length === 0) return alert('يرجى اختيار صورة واحدة على الأقل');
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (demoLink) formData.append('demo_link', demoLink);
    
    Array.from(images).forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post('/admin/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setDescription('');
      setDemoLink('');
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchProjects();
      alert('تمت إضافة المشروع بنجاح!');
    } catch (err) {
      alert('حدث خطأ أثناء إضافة المشروع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع نهائياً مع صوره؟')) return;
    try {
      await api.delete(`/admin/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-gray-900 border-l border-gray-800 p-6 flex flex-col z-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard size={20} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">الإدارة</h2>
        </div>
        
        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-right ${activeTab === 'projects' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'}`}
          >
            <ImageIcon size={22} className={activeTab === 'projects' ? 'text-blue-400' : ''} /> إدارة المشاريع
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all font-medium text-right ${activeTab === 'messages' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'}`}
          >
            <div className="flex items-center gap-4">
              <MessageSquare size={22} className={activeTab === 'messages' ? 'text-blue-400' : ''} /> الرسائل
            </div>
            {messages.length > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-md">{messages.length}</span>}
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-right ${activeTab === 'settings' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent'}`}
          >
            <Settings size={22} className={activeTab === 'settings' ? 'text-blue-400' : ''} /> الإعدادات العامة
          </button>
          
          <div className="my-8 h-px bg-gray-800"></div>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-medium text-right text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            <Globe size={22} /> زيارة الموقع
          </button>
        </nav>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 mt-auto rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium border border-red-500/10 hover:border-red-500/30"
        >
          <LogOut size={20} /> تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto h-screen relative">
        <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
        
        {activeTab === 'projects' && (
          <div className="max-w-6xl mx-auto space-y-12 relative z-10">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">إدارة المشاريع</h1>
              <p className="text-gray-400">أضف، عدل، واحذف مشاريعك التي ستعرض في الصفحة الرئيسية.</p>
            </header>

            {/* Add Project Form */}
            <div className="bg-gray-900/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-800 shadow-xl">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Plus size={20} /></div>
                إضافة مشروع جديد
              </h3>
              <form onSubmit={handleAddProject} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">عنوان المشروع *</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600" placeholder="مثال: تطبيق متجر إلكتروني" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">رابط المعاينة / المتجر (اختياري)</label>
                    <input type="url" value={demoLink} onChange={e => setDemoLink(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-left placeholder-gray-600" dir="ltr" placeholder="https://..." />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">وصف المشروع *</label>
                  <textarea required rows="5" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder-gray-600" placeholder="اكتب تفاصيل وتقنيات المشروع..." />
                </div>
                <div className="bg-gray-950 p-6 rounded-xl border border-gray-800 border-dashed hover:border-blue-500/50 transition-colors">
                  <label className="block text-sm font-medium text-gray-400 mb-4 text-center cursor-pointer">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><ImageIcon size={28} /></div>
                    <span className="block text-white font-medium mb-1">اختر صور المشروع</span>
                    <span className="block text-xs text-gray-500 mb-4">يمكنك تحديد عدة صور، ويفضل أن تكون عالية الدقة</span>
                    <input type="file" ref={fileInputRef} multiple accept="image/*" onChange={e => setImages(e.target.files)} className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer text-center mx-auto" required />
                  </label>
                </div>
                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                    {isSubmitting ? 'جاري الرفع والإضافة...' : 'حفظ ونشر المشروع'}
                  </button>
                </div>
              </form>
            </div>

            {/* Projects List */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">المشاريع المضافة ({projects.length})</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map(project => (
                  <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors group flex flex-col">
                    <div className="h-48 bg-gray-800 overflow-hidden relative">
                      {project.images.length > 0 && <img src={`http://127.0.0.1:8000${project.images[0].image_path}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-gray-700 flex items-center gap-1">
                        <ImageIcon size={12} /> {project.images.length}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h4 className="font-bold text-xl mb-2 text-white line-clamp-1">{project.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1">{project.description}</p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        {project.demo_link ? (
                          <a href={project.demo_link} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
                            رابط المعاينة <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="text-gray-600 text-sm">لا يوجد رابط</span>
                        )}
                        <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors" title="حذف المشروع">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500"><ImageIcon size={24} /></div>
                    <p className="text-gray-400 text-lg">لم تقم بإضافة أي مشاريع حتى الآن.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-6xl mx-auto relative z-10">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">صندوق الوارد</h1>
              <p className="text-gray-400">جميع رسائل التواصل التي وصلت من زوار الموقع.</p>
            </header>
            
            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead className="bg-gray-800/50 text-gray-400 text-sm">
                    <tr>
                      <th className="p-5 font-medium border-b border-gray-800">المرسل</th>
                      <th className="p-5 font-medium border-b border-gray-800">وسيلة التواصل</th>
                      <th className="p-5 font-medium border-b border-gray-800">التاريخ</th>
                      <th className="p-5 font-medium border-b border-gray-800 w-1/2">محتوى الرسالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {messages.map(msg => (
                      <tr key={msg.id} className="hover:bg-gray-800/30 transition-colors group">
                        <td className="p-5 whitespace-nowrap font-medium text-white">{msg.sender_name}</td>
                        <td className="p-5 whitespace-nowrap">
                          <a href={`mailto:${msg.sender_contact}`} className="text-blue-400 hover:underline inline-block" dir="ltr">{msg.sender_contact}</a>
                        </td>
                        <td className="p-5 whitespace-nowrap text-sm text-gray-500">{new Date(msg.created_at).toLocaleDateString('ar-SA')}</td>
                        <td className="p-5 text-gray-300 leading-relaxed max-w-md">{msg.message_text}</td>
                      </tr>
                    ))}
                    {messages.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-16 text-center">
                          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500"><MessageSquare size={24} /></div>
                          <p className="text-gray-400 text-lg">صندوق الوارد فارغ.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-6xl mx-auto relative z-10">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">الإعدادات العامة</h1>
              <p className="text-gray-400">تخصيص البيانات الأساسية المعروضة في موقعك.</p>
            </header>
            
            <div className="bg-gray-900/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-800 shadow-xl max-w-2xl mb-8">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-4">تخصيص الواجهة والصورة</h2>
              
              <form onSubmit={handleUploadProfilePicture} className="space-y-6 mb-10 pb-8 border-b border-gray-800/50">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">الصورة الشخصية الرئيسية</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <input type="file" accept="image/*" onChange={e => setProfilePicture(e.target.files[0])} className="block w-full text-sm text-gray-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                    <button type="submit" disabled={isUploadingImage || !profilePicture} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg whitespace-nowrap">
                      {isUploadingImage ? 'جاري الرفع...' : 'تحديث الصورة'}
                    </button>
                  </div>
                </div>
              </form>

              <form onSubmit={handleSaveSettings} className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">الاسم الشخصي (يظهر تحت الصورة)</label>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600" placeholder="مثال: محمد أحمد" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">رابط الواتساب (WhatsApp)</label>
                  <input type="text" value={whatsappLink} onChange={e => setWhatsappLink(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder-gray-600" placeholder="https://wa.me/9677..." dir="ltr" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">رابط انستقرام (Instagram)</label>
                  <input type="text" value={instagramLink} onChange={e => setInstagramLink(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder-gray-600" placeholder="https://instagram.com/..." dir="ltr" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">رابط لينكد إن (LinkedIn)</label>
                  <input type="text" value={linkedinLink} onChange={e => setLinkedinLink(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600" placeholder="https://linkedin.com/in/..." dir="ltr" />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isSavingSettings} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                    {isSavingSettings ? 'جاري الحفظ...' : 'حفظ الاسم'}
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-gray-800 shadow-xl max-w-2xl">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-gray-800 pb-4">تغيير بيانات الدخول للوحة التحكم</h2>
              <form onSubmit={handleUpdateCredentials} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">اسم المستخدم الجديد</label>
                  <input type="text" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600" placeholder="admin" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 ml-1">كلمة المرور الجديدة</label>
                  <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-600" placeholder="••••••••" dir="ltr" />
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isSavingCreds} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-500/20">
                    {isSavingCreds ? 'جاري التحديث...' : 'تحديث بيانات الدخول'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
