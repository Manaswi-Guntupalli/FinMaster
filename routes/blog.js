const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Blog = require('../models/Blog');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads/blogs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   POST /api/blog/create
// @desc    Create a new blog post
// @access  Private (Authenticated users)
router.post('/create', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, excerpt, content, tags } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: 'Title, excerpt, and content are required' });
    }

    // Get author details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare blog data
    const blogData = {
      title,
      excerpt,
      content,
      author: req.userId,
      authorName: user.username,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())) : []
    };

    // Add featured image if uploaded
    if (req.file) {
      blogData.featuredImage = '/uploads/blogs/' + req.file.filename;
    }

    // Create blog post
    const blog = new Blog(blogData);
    await blog.save();

    console.log('✅ Blog created:', blog.title, 'by', user.username);

    res.status(201).json({
      message: 'Blog post created successfully!',
      blog: blog
    });

  } catch (error) {
    console.error('❌ Error creating blog:', error);
    res.status(500).json({ message: 'Failed to create blog post', error: error.message });
  }
});

// @route   GET /api/blog/all
// @desc    Get all published blog posts
// @access  Public
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tag = '' } = req.query;

    // Build query
    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (tag) {
      query.tags = tag;
    }

    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('author', 'username')
      .select('-content'); // Exclude full content for list view

    const totalBlogs = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / parseInt(limit)),
      currentPage: parseInt(page)
    });

  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

// @route   GET /api/blog/:id
// @desc    Get a single blog post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);

  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog post', error: error.message });
  }
});

// @route   PUT /api/blog/:id
// @desc    Update a blog post
// @access  Private (Author only)
router.put('/:id', auth, upload.single('featuredImage'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only edit your own blog posts' });
    }

    const { title, excerpt, content, tags, isPublished } = req.body;

    // Update fields
    if (title) blog.title = title;
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (tags) blog.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (isPublished !== undefined) blog.isPublished = isPublished;

    // Update featured image if new one uploaded
    if (req.file) {
      // Delete old image if it exists and is not default
      if (blog.featuredImage && blog.featuredImage !== 'default-blog.png') {
        const oldImagePath = path.join(__dirname, '../public', blog.featuredImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.featuredImage = '/uploads/blogs/' + req.file.filename;
    }

    await blog.save();

    console.log('✅ Blog updated:', blog.title);

    res.json({ message: 'Blog post updated successfully!', blog });

  } catch (error) {
    console.error('❌ Error updating blog:', error);
    res.status(500).json({ message: 'Failed to update blog post', error: error.message });
  }
});

// @route   DELETE /api/blog/:id
// @desc    Delete a blog post
// @access  Private (Author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user is the author
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own blog posts' });
    }

    // Delete featured image if exists
    if (blog.featuredImage && blog.featuredImage !== 'default-blog.png') {
      const imagePath = path.join(__dirname, '../public', blog.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);

    console.log('🗑️ Blog deleted:', blog.title);

    res.json({ message: 'Blog post deleted successfully!' });

  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    res.status(500).json({ message: 'Failed to delete blog post', error: error.message });
  }
});

// @route   POST /api/blog/:id/like
// @desc    Like a blog post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    blog.likes += 1;
    await blog.save();

    res.json({ likes: blog.likes });

  } catch (error) {
    console.error('❌ Error liking blog:', error);
    res.status(500).json({ message: 'Failed to like blog post', error: error.message });
  }
});

// @route   GET /api/blog/user/my-blogs
// @desc    Get blogs by current user
// @access  Private
router.get('/user/my-blogs', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.userId })
      .sort({ createdAt: -1 });

    res.json({ blogs });

  } catch (error) {
    console.error('❌ Error fetching user blogs:', error);
    res.status(500).json({ message: 'Failed to fetch your blogs', error: error.message });
  }
});

module.exports = router;
