import { useState } from 'react';
import { X, Copy, Download, RefreshCw, Linkedin, Twitter, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const JobPostModal = ({ isOpen, onClose, posts, onRegenerate, loading }) => {
  const [activeTab, setActiveTab] = useState('linkedin');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  console.log('🔍 JobPostModal - Posts:', posts);
  console.log('🔍 Active Tab:', activeTab);
  console.log('🔍 Active Post:', posts?.[activeTab]);

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'naukri', name: 'Naukri', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'indeed', name: 'Indeed', icon: Sparkles, color: 'text-blue-700', bg: 'bg-blue-50' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-gray-900', bg: 'bg-gray-100' }
  ];

  const activePost = posts?.[activeTab];

  const handleCopy = async () => {
    if (!activePost?.content) return;
    
    try {
      await navigator.clipboard.writeText(activePost.content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!activePost?.content) return;

    const element = document.createElement('a');
    const file = new Blob([activePost.content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTab}-job-post.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded!');
  };

  const getPlatformPreview = () => {
    if (!activePost) return null;

    const platformStyles = {
      linkedin: {
        container: 'bg-white border-2 border-blue-100 rounded-xl p-6',
        text: 'text-gray-800 whitespace-pre-line leading-relaxed'
      },
      naukri: {
        container: 'bg-white border-2 border-indigo-100 rounded-xl p-6',
        text: 'text-gray-800 whitespace-pre-line leading-relaxed'
      },
      indeed: {
        container: 'bg-white border-2 border-blue-100 rounded-xl p-6',
        text: 'text-gray-800 whitespace-pre-line leading-relaxed'
      },
      twitter: {
        container: 'bg-gray-50 border-2 border-gray-200 rounded-2xl p-4',
        text: 'text-gray-900 text-base leading-snug'
      }
    };

    const style = platformStyles[activeTab];

    return (
      <div className={style.container}>
        <div className={style.text}>{activePost.content}</div>
        
        {activePost.hashtags && activePost.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            {activePost.hashtags.map((tag, idx) => (
              <span key={idx} className="text-blue-600 text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="w-6 h-6 mr-2" />
                AI-Generated Job Posts
              </h2>
              <p className="text-blue-100 mt-1">Platform-optimized posts ready to publish</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 overflow-x-auto">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.id}
                onClick={() => setActiveTab(platform.id)}
                className={`flex items-center space-x-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                  activeTab === platform.id
                    ? `border-b-2 border-blue-600 ${platform.color} bg-white`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{platform.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Generating platform-specific posts...</p>
            </div>
          ) : activePost ? (
            <div className="space-y-4">
              {/* Debug Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
                <p><strong>Debug:</strong> Post exists: {activePost ? 'Yes' : 'No'}</p>
                <p><strong>Content length:</strong> {activePost?.content?.length || 0}</p>
                <p><strong>Content preview:</strong> {activePost?.content?.substring(0, 50)}...</p>
              </div>

              {/* Character Count */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">
                    <strong>Characters:</strong> {activePost.characterCount}
                  </span>
                  {activeTab === 'twitter' && (
                    <span className={`font-semibold ${activePost.characterCount <= 280 ? 'text-green-600' : 'text-red-600'}`}>
                      {activePost.characterCount <= 280 ? '✓ Within limit' : '⚠ Too long'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  Generated {new Date(activePost.generatedAt).toLocaleTimeString()}
                </span>
              </div>

              {/* Preview */}
              {getPlatformPreview()}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No post generated for this platform</p>
              <p className="text-xs mt-2">Active tab: {activeTab}</p>
              <p className="text-xs">Posts object: {JSON.stringify(posts)}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                disabled={!activePost || loading}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={!activePost || loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Future: Direct Posting */}
          {/* <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-sm text-gray-600 mb-3">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Coming soon: Direct posting to platforms
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed">
                Post to LinkedIn
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed">
                Post to Twitter
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default JobPostModal;
