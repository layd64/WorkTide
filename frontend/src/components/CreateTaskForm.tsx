import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_ENDPOINTS } from '../config/api';
import SkillSelector from './SkillSelector';
import { validateTextLength, validateNumberRange, validateArrayLength, validateFile } from '../utils/validation';

interface CreateTaskFormProps {
  onTaskCreated: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onTaskCreated }) => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    skills: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setFormData((prev) => ({
      ...prev,
      skills,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const titleError = validateTextLength(formData.title, 'Title', 3, 200);
    if (titleError) {
      setError(titleError);
      setIsSubmitting(false);
      return;
    }

    const descriptionError = validateTextLength(formData.description, 'Description', 10, 5000);
    if (descriptionError) {
      setError(descriptionError);
      setIsSubmitting(false);
      return;
    }

    const budgetError = validateNumberRange(formData.budget, 'Budget', 1, 1000000);
    if (budgetError) {
      setError(budgetError);
      setIsSubmitting(false);
      return;
    }

    // Filter out empty skills (should not be needed with SkillSelector, but kept for safety)
    const filteredSkills = formData.skills.filter((skill) => skill.trim() !== '');

    // Validate that at least one skill is selected
    const skillsError = validateArrayLength(filteredSkills, 'Skills', 1, 20);
    if (skillsError) {
      setError(skillsError);
      setIsSubmitting(false);
      return;
    }

    // Validate that an image is selected
    const fileError = validateFile(imageFile, 5);
    if (fileError) {
      setError(fileError);
      setIsSubmitting(false);
      return;
    }

    try {
      // First, upload the image
      setUploadingImage(true);
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const imageResponse = await fetch(API_ENDPOINTS.upload, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageFormData,
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const { url } = await imageResponse.json();
      setUploadingImage(false);

      // Then create the task with the image URL
      const response = await fetch(API_ENDPOINTS.tasks.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget),
          skills: filteredSkills,
          imageUrl: url,
        }),
      });

      if (response.ok) {
        setSuccess(t('taskCreatedSuccess'));
        setFormData({
          title: '',
          description: '',
          budget: 0,
          skills: [],
        });
        setImageFile(null);
        setImagePreview(null);
        onTaskCreated();
      } else {
        const errorData = await response.json();
        setError(errorData.message || t('failedToCreateTask'));
      }
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg sm:rounded-xl overflow-hidden`}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8 sm:px-8">
          <h2 className="text-3xl font-bold text-white">{t('createNewTask')}</h2>
          <p className="mt-2 text-indigo-100">{t('createTaskSubtitle')}</p>
        </div>

        <div className="px-6 py-8 sm:px-8">
          {error && (
            <div className={`${isDark ? 'bg-red-900/20 border-red-500' : 'bg-red-50 border-red-400'} border-l-4 p-4 mb-6 rounded-r-md`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className={`${isDark ? 'bg-green-900/20 border-green-500' : 'bg-green-50 border-green-400'} border-l-4 p-4 mb-6 rounded-r-md`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className={`flex items-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {t('taskTitle')}
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm`}
                placeholder={t('taskTitlePlaceholder')}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={`flex items-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                {t('projectDescription')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm`}
                placeholder={t('projectDescriptionPlaceholder')}
              />
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('descriptionHint')}</p>
            </div>

            {/* Task Image */}
            <div>
              <label htmlFor="taskImage" className={`flex items-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t('taskImage')} <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="file"
                id="taskImage"
                accept="image/*"
                required={!imageFile} // Only required if no file is selected yet
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="taskImage"
                className={`cursor-pointer inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isDark ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}
              >
                <svg className={`-ml-1 mr-2 h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {imageFile ? t('changeImage') : t('selectImage')}
              </label>
              <span className={`ml-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{imageFile ? imageFile.name : t('noFileChosen')}</span>
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Task preview"
                    className={`w-full h-48 object-cover rounded-lg border-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                  />
                </div>
              )}
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('imageHint')}</p>
            </div>

            {/* Budget and Skills Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget */}
              <div>
                <label htmlFor="budget" className={`flex items-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('budgetUSD')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'} sm:text-sm`}>$</span>
                  </div>
                  <input
                    type="number"
                    name="budget"
                    id="budget"
                    required
                    min="1"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`block w-full pl-7 pr-4 py-2.5 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'} shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all sm:text-sm`}
                    placeholder={t('budgetPlaceholder')}
                  />
                </div>
                <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('budgetHint')}</p>
              </div>

              {/* Skills Count Info */}
              <div className="flex items-end pb-2">
                <div className="bg-indigo-50 rounded-lg p-4 w-full border border-indigo-100">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-indigo-900">{formData.skills.length} {formData.skills.length === 1 ? t('skillsSelected') : t('skillsSelectedPlural')}</p>
                      <p className="text-xs text-indigo-600">{t('chooseRelevantSkills')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className={`flex items-center text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('requiredSkills')}
              </label>
              <SkillSelector
                selectedSkills={formData.skills}
                onChange={handleSkillsChange}
                isDark={isDark}
              />
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('skillsHint')}
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('creatingTask')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('createTask')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskForm; 