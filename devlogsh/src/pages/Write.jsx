import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Image, ImagePlus } from 'lucide-react';
import { supabase } from '../utilities/supabase';
import { useParams } from 'react-router';
import {
    MDXEditor,
    linkDialogPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    InsertCodeBlock,
    ListsToggle,
    InsertThematicBreak,
    codeBlockPlugin,
    codeMirrorPlugin,
    toolbarPlugin,
    listsPlugin,
    headingsPlugin,
    markdownShortcutPlugin,
    imagePlugin,
    linkPlugin,
    CreateLink
} from '@mdxeditor/editor';

import '@mdxeditor/editor/style.css';
import '../assets/stylesheets/WritePostEditor.css';

export default function WritePostEditor() {
    const API = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const { slug } = useParams();

    const [contentKey, setContentKey] = useState(Date.now());
    const [isEditing, setIsEditing] = useState(false);
    const [originalSlug, setOriginalSlug] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [coverPreview, setCoverPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [content, setContent] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [error, setError] = useState('');

    const editorWrapperRef = useRef(null);
    const editorInstanceRef = useRef(null);
    const imageInputRef = useRef(null);

    const emptyGradient = useMemo(() => generateRandomGradient(), []);

    useEffect(() => {
        const checkDarkMode = () =>
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handleEditorContainerClick = (e) => {
        const editable = editorWrapperRef.current?.querySelector('[contenteditable="true"]');
        if (!editable) return;

        const bounds = editable.getBoundingClientRect();
        const { clientX, clientY } = e;

        const isInside = document.elementFromPoint(clientX, clientY)?.closest('[contenteditable="true"]');

        if (!isInside && clientY > bounds.bottom) {
            editable.focus();
            const range = document.createRange();
            range.selectNodeContents(editable);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        try {
            setImageUploading(true);
            const editable = editorWrapperRef.current?.querySelector('[contenteditable="true"]');
            if (editable) {
                editable.focus();
                const range = document.createRange();
                range.selectNodeContents(editable);
                range.collapse(false);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }

            const ext = file.name.split('.').pop();
            const filename = `editor-${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from('blog-images').upload(filename, file, { upsert: true });
            if (error) throw error;
            const { data } = supabase.storage.from('blog-images').getPublicUrl(filename);
            if (data?.publicUrl && editorInstanceRef.current) {
                const markdown = `![](${data.publicUrl})`;
                editorInstanceRef.current.insertMarkdown(markdown);
            }
        } catch (err) {
            console.error('Image upload failed', err);
        } finally {
            setImageUploading(false);
            if (imageInputRef.current) imageInputRef.current.value = '';
        }
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cover-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage.from('blog-images').upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: publicData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
            setCoverImage(publicData.publicUrl);
            setCoverPreview(publicData.publicUrl);
        } catch (err) {
            console.error('Upload error', err);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (!slug) return;
        const fetchPost = async () => {
            try {
                const res = await fetch(`${API}/api/posts/${slug}`);
                if (!res.ok) throw new Error('Post not found');
                const data = await res.json();
                setTitle(data.title || '');
                setDescription(data.description || '');
                setTags((data.tags || []).join(', '));
                setCoverImage(data.cover_image || '');
                setCoverPreview(data.cover_image || '');
                setContent(data.content || '');
                setIsEditing(true);
                setOriginalSlug(data.slug);
                setContentKey(Date.now());
            } catch (err) {
                console.error('Failed to load post:', err);
                setError('Failed to load post for editing');
            }
        };
        fetchPost();
    }, [slug]);

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API}/api/posts/${originalSlug}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const res = await response.json();
            if (!response.ok) throw new Error(res?.error || 'Failed to delete post');

            navigate(-1);
        } catch (err) {
            console.error('Delete error:', err);
            setError(err.message || 'Failed to delete post');
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const handleSubmit = async () => {
        setError('');
        if (!title.trim() || !content.trim()) {
            setError('Title and content are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const method = isEditing ? 'PUT' : 'POST';
            const endpoint = isEditing ? `${API}/api/posts/${originalSlug}` : `${API}/api/posts`;

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    description,
                    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
                    cover_image: coverImage || '',
                }),
            });

            const res = await response.json();
            if (!response.ok) throw new Error(res?.error || 'Something went wrong');

            navigate(`/post/${res.slug}`);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to publish post');
        }
    };

    return (
        <div className="w-full max-w-[1300px] mx-auto min-h-screen p-4 text-black dark:text-white flex flex-col lg:flex-row gap-6 pt-20 md:pt-8">
            {/* Sidebar */}
            <div className="w-full lg:w-1/4 p-4 rounded-xl space-y-4 h-fit">
                <input
                    className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"
                    placeholder="Post Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <div>
                    <textarea
                        className="custom-scrollbar w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700 resize-none"
                        placeholder="Post description"
                        maxLength={250}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground text-right block">
                        {description.length}/250
                    </span>
                </div>

                <input
                    className="w-full p-2 rounded bg-white dark:bg-zinc-800 border dark:border-zinc-700"
                    placeholder="Tags (comma-separated)"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
                <label className="cursor-pointer text-sm font-medium flex items-center gap-1">
                    <Image size={16} /> Upload Cover
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
                {uploading && <span className="text-sm">Uploading cover...</span>}
                <div
                    className="mt-2 rounded w-full h-40 border dark:border-zinc-700"
                    style={{
                        backgroundImage: coverPreview ? `url(${coverPreview})` : emptyGradient,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="hidden md:block flex w-full flex-col gap-2">
                    <button
                        onClick={handleSubmit}
                        className="mt-6 w-full lg:mt-8 px-6 py-2 border rounded-full hover:bg-white hover:text-[#1d3439] transition"
                    >
                        {isEditing ? 'Update Post' : 'Publish Post'}
                    </button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                {isEditing && (
                    <button
                        onClick={handleDelete}
                        className="mt-2 w-full px-6 py-2 border border-red-600 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition"
                    >
                        Delete Post
                    </button>
                )}
            </div>

            {/* Editor */}
            <div
                ref={editorWrapperRef}
                onClick={handleEditorContainerClick}
                className="w-full lg:w-3/4 bg-lightCard dark:bg-darkCard p-4 rounded-xl flex flex-col"
            >
                <MDXEditor
                    className={`prose dark:prose-invert min-h-screen rich-editor w-full grow ${isDarkMode ? 'dark-editor dark-theme' : 'light-editor'}`}
                    key={contentKey}
                    markdown={content || ''}
                    onChange={setContent}
                    ref={editorInstanceRef}
                    plugins={[
                        headingsPlugin(),
                        listsPlugin(),
                        imagePlugin(),
                        linkPlugin(),
                        linkDialogPlugin(),
                        codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
                        codeMirrorPlugin({
                            codeBlockLanguages: {
                                js: 'JavaScript',
                                ts: 'TypeScript',
                                css: 'CSS',
                                html: 'HTML',
                                bash: 'bash',
                            },
                        }),
                        markdownShortcutPlugin(),
                        toolbarPlugin({
                            toolbarClassName: 'editor-toolbar',
                            toolbarContents: () => (
                                <>
                                    <UndoRedo />
                                    <BoldItalicUnderlineToggles />
                                    <InsertCodeBlock />
                                    <ListsToggle />
                                    <InsertThematicBreak />
                                    <CreateLink />
                                    <BlockTypeSelect />
                                    <label className="ml-2 p-1 cursor-pointer" title="Insert Image">
                                        <ImagePlus size={16} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={imageInputRef}
                                            onChange={(e) => handleImageUpload(e.target.files[0])}
                                        />
                                    </label>
                                </>
                            )
                        })
                    ]}
                />
            </div>

            {/* Mobile submit button */}
            <div className="lg:hidden w-full mt-0 px-4">
                <button
                    onClick={handleSubmit}
                    className="w-full px-6 py-2 border rounded-full hover:bg-white hover:text-[#1d3439] transition"
                >
                    {isEditing ? 'Update post' : 'Publish Post'}
                </button>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
                            Are you sure you want to delete this post? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 rounded border dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function generateRandomGradient() {
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + Math.floor(Math.random() * 90) + 60) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 60%))`;
}
