import request from 'supertest';
import app from '../app.js'; 

describe('DEVLOG API Endpoints', () => {
  let token = '';
  let postId = '';
  let commentId = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'testpassword',
      });
    token = res.body.token;
    expect(token).toBeDefined();
  });

  test('Create a blog post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My Test Blog',
        content: '## Markdown Content\nThis is a blog post.',
        tags: ['test', 'api'],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('My Test Blog');
    postId = res.body.id;
  });

  test('Get my posts', async () => {
    const res = await request(app)
      .get('/api/posts/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Create top-level comment', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        post_id: postId,
        content: 'This is a test comment.',
      });

    expect(res.statusCode).toBe(201);
    commentId = res.body.id;
  });

  test('Add feedback', async () => {
    const res = await request(app)
      .post('/api/feedback')
      .set('Authorization', `Bearer ${token}`)
      .send({
        post_id: postId,
        rating: 5,
        comment: 'Great blog!',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(5);
  });

  test('Get average feedback', async () => {
    const res = await request(app)
      .get(`/api/feedback/post/${postId}/average`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(typeof res.body.average).toBe('number');
  });
});
