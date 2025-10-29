import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon, XCircleIcon, PlusIcon, CameraIcon } from '@heroicons/react/24/outline';
import { useAccessibility } from '../contexts/AccessibilityContext';
import Avatar from '../components/Avatar';
import SkillSelector from '../components/SkillSelector';

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { user, updateProfile, uploadAvatar } = useAuth();
  const {
    fontSize, setFontSize,
    highContrast, setHighContrast,
    reducedMotion, setReducedMotion,
    highlightLinks, setHighlightLinks,
    bigCursor, setBigCursor,
    readingGuide, setReadingGuide,
    saturation, setSaturation,
    invertColors, setInvertColors
  } = useAccessibility();
  const navigate = useNavigate();

  // Add loading state
  const [loading, setLoading] = useState<boolean>(true);

  // Profile form state
  const [title, setTitle] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState<string>('');
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setTitle(user.title || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setHourlyRate(user.hourlyRate ? user.hourlyRate.toString() : '');
      setSkills(user.skills || []);
      setLanguages(user.languages || []);
      setEducation(user.education || []);
      setExperience(user.experience || []);

      // Ensure isHidden is properly initialized as a boolean
      const hiddenValue = user.isHidden === true;
      setIsHidden(hiddenValue);

      // Initialize isAvatarVisible
      const avatarVisibleValue = user.isAvatarVisible !== undefined ? user.isAvatarVisible : true;
      setIsAvatarVisible(avatarVisibleValue);

      setLoading(false);
    } else {
      // If no user data is available after a short timeout, redirect to profile
      const timer = setTimeout(() => {
        if (!user) {
          navigate('/profile');
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Handle adding a new language
  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  // Handle removing a language
  const handleRemoveLanguage = (languageToRemove: string) => {
    setLanguages(languages.filter(lang => lang !== languageToRemove));
  };

  // Handle adding a new education entry
  const handleAddEducation = () => {
    setEducation([...education, { institution: '', degree: '', year: '' }]);
  };

  // Handle updating education entry
  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updatedEducation = [...education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setEducation(updatedEducation);
  };

  // Handle removing an education entry
  const handleRemoveEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Handle adding a new experience entry
  const handleAddExperience = () => {
    setExperience([...experience, { company: '', role: '', period: '', description: '' }]);
  };

  // Handle updating experience entry
  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const updatedExperience = [...experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setExperience(updatedExperience);
  };

  // Handle removing an experience entry
  const handleRemoveExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Handle toggle for isHidden
  const handleToggleHidden = () => {
    const newValue = !isHidden;
    setIsHidden(newValue);
  };

  // Handle toggle for isAvatarVisible
  const handleToggleAvatarVisible = () => {
    setIsAvatarVisible(!isAvatarVisible);
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // Upload avatar if selected
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }

      const profileData = {
        title,
        bio,
        location,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        skills,
        languages,
        education,
        experience,
        isHidden,
        isAvatarVisible
      };

      const success = await updateProfile(profileData);

      if (success) {
        setSaveSuccess(true);
        // Navigate to profile page after 1.5 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setSaveError(t('errorSavingProfile'));
      }
    } catch (error) {
      setSaveError(t('errorSavingProfile'));
    } finally {
      setSaving(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>{t('settings')}</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Platform Settings Section */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 pb-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>{t('appSettings')}</h2>
                <div className="space-y-6">

                  {/* Profile Visibility - available to all users */}
                  <div className="mb-6">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{t('profileVisibility') || 'Profile Visibility'}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('makeProfileHidden') || 'Make my account hidden'}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({t('hiddenProfileInfo') || 'Your profile will not appear on the Find Freelancers page'})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleHidden}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isHidden ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={isHidden}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isHidden ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Accessibility Settings */}
                  <div className={`mb-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{t('accessibility') || 'Accessibility'}</h3>

                    {/* Font Size */}
                    <div className="mb-4">
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        {t('fontSize') || 'Font Size'}
                      </label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => setFontSize('normal')}
                          className={`px-3 py-2 border rounded-md text-sm ${fontSize === 'normal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`
                            }`}
                        >
                          {t('normal')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontSize('large')}
                          className={`px-3 py-2 border rounded-md text-base ${fontSize === 'large'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`
                            }`}
                        >
                          {t('large')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFontSize('xlarge')}
                          className={`px-3 py-2 border rounded-md text-lg ${fontSize === 'xlarge'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`
                            }`}
                        >
                          {t('extraLarge')}
                        </button>
                      </div>
                    </div>

                    {/* High Contrast */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('highContrast') || 'High Contrast'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHighContrast(!highContrast)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${highContrast ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={highContrast}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Reduced Motion */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('reducedMotion') || 'Reduced Motion'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReducedMotion(!reducedMotion)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={reducedMotion}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Highlight Links */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('highlightLinks') || 'Highlight Links'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHighlightLinks(!highlightLinks)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${highlightLinks ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={highlightLinks}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highlightLinks ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Big Cursor */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('bigCursor') || 'Big Cursor'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBigCursor(!bigCursor)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${bigCursor ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={bigCursor}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${bigCursor ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Reading Guide */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('readingGuide') || 'Reading Guide'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReadingGuide(!readingGuide)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${readingGuide ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={readingGuide}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${readingGuide ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Invert Colors */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('invertColors') || 'Invert Colors'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInvertColors(!invertColors)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${invertColors ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={invertColors}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${invertColors ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    {/* Saturation */}
                    <div className="mb-4">
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        {t('saturation') || 'Saturation'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSaturation('normal')}
                          className={`px-3 py-2 border rounded-md text-sm ${saturation === 'normal'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`
                            }`}
                        >
                          {t('normal')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSaturation('low')}
                          className={`px-3 py-2 border rounded-md text-sm ${saturation === 'low'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`
                            }`}
                        >
                          {t('low')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSaturation('high')}
                          className={`px-3 py-2 border rounded-md text-sm ${saturation === 'high'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`
                            }`}
                        >
                          {t('high')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSaturation('bw')}
                          className={`px-3 py-2 border rounded-md text-sm ${saturation === 'bw'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : `${isDark ? 'bg-gray-800 text-gray-300 border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`
                            }`}
                        >
                          {t('bw')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <div className="mb-6">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{t('appearance')}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {theme === 'light' ? (
                          <SunIcon className="h-6 w-6 text-yellow-500" />
                        ) : (
                          <MoonIcon className="h-6 w-6 text-blue-400" />
                        )}
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{t('darkMode')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        role="switch"
                        aria-checked={theme === 'dark'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Language Settings */}
                  <div>
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>{t('language')}</h3>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => changeLanguage('en')}
                        className={`w-full flex items-center justify-between p-3 rounded-md border ${language === 'en'
                          ? `border-blue-500 ${isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}`
                          : `${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`
                          }`}
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🇺🇸</span>
                          <span className="font-medium">English</span>
                        </div>
                        {language === 'en' && (
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => changeLanguage('uk')}
                        className={`w-full flex items-center justify-between p-3 rounded-md border ${language === 'uk'
                          ? `border-blue-500 ${isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}`
                          : `${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`
                          }`}
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">🇺🇦</span>
                          <span className="font-medium">Українська</span>
                        </div>
                        {language === 'uk' && (
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Settings Section */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-6 pb-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>{t('profileInformation')}</h2>

                {/* Profile Picture Section */}
                <div className="mb-8">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('profilePicture') || 'Profile Picture'}</h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                      <Avatar
                        fullName={user?.fullName || 'User'}
                        imageUrl={avatarPreview || user?.imageUrl}
                        className="w-24 h-24 text-xl"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-sm"
                      >
                        <CameraIcon className="w-4 h-4" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between max-w-md">
                        <div className="flex flex-col">
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('showAvatarToOthers') || 'Show profile picture to others'}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {t('avatarVisibilityInfo') || 'If disabled, only you will see your profile picture.'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleAvatarVisible}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isAvatarVisible ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          role="switch"
                          aria-checked={isAvatarVisible}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvatarVisible ? 'translate-x-6' : 'translate-x-1'
                              }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Section */}
                <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('profileInformation')}</h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-4">
                      <label htmlFor="title" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('professionalTitle')}
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md px-4 py-2`}
                          placeholder="UI/UX Designer"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="bio" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('aboutMe')}
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="bio"
                          rows={4}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md px-4 py-2`}
                          placeholder="Tell potential clients about yourself..."
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="location" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('location')}
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md px-4 py-2`}
                          placeholder="e.g. New York, USA"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="hourlyRate" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {t('hourlyRate')} (USD)
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} sm:text-sm`}>$</span>
                        </div>
                        <input
                          type="number"
                          id="hourlyRate"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-4 py-2 sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('skills')}</h2>
                  <div className="space-y-4">
                    <SkillSelector
                      selectedSkills={skills}
                      onChange={setSkills}
                    />
                  </div>
                </div>

                {/* Languages Section */}
                <div>
                  <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{t('languages')}</h2>
                  <div className="space-y-4">
                    <div className="flex">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        className={`flex-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-l-md px-4 py-2`}
                        placeholder="Add a language (e.g. English (Native))"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLanguage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddLanguage}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {languages.map((lang, index) => (
                        <div key={index} className={`flex items-center ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'} px-3 py-1 rounded-full`}>
                          <span className="text-sm">{lang}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang)}
                            className={`ml-1 ${isDark ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-800'}`}
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('education')}</h2>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${isDark ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-900/40' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      {t('addEducation')}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index} className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-md p-4`}>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('educationNumber')}{index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(index)}
                            className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('institution')}
                            </label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                              className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md px-4 py-2`}
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('year')}
                            </label>
                            <input
                              type="text"
                              value={edu.year}
                              onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                              className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md px-4 py-2`}
                            />
                          </div>

                          <div className="sm:col-span-6">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('degree')}
                            </label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                              className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md px-4 py-2`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('workExperience')}</h2>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${isDark ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-900/40' : 'text-blue-600 bg-blue-100 hover:bg-blue-200'}`}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      {t('addExperience')}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div key={index} className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded-md p-4`}>
                        <div className="flex justify-between items-start mb-4">
                          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('experienceNumber')}{index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('company')}
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                              className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md`}
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('period')}
                            </label>
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => handleExperienceChange(index, 'period', e.target.value)}
                              className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md`}
                              placeholder="2019-2022"
                            />
                          </div>

                          <div className="sm:col-span-6">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('role')}
                            </label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                              className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md`}
                            />
                          </div>

                          <div className="sm:col-span-6">
                            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t('description')}
                            </label>
                            <textarea
                              rows={3}
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                              className={`mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} rounded-md`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className={`${isDark ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'} py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3`}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? t('saving') : t('saveChanges')}
                  </button>
                </div>
              </div>

              {saveError && (
                <div className={`mt-4 text-sm ${isDark ? 'text-red-400' : 'text-red-600'} text-center`}>
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className={`mt-4 text-sm ${isDark ? 'text-green-400' : 'text-green-600'} text-center`}>
                  {t('profileSaved')}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;