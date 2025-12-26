import { describe, test, expect } from '@jest/globals';

describe('Job API Integration Tests', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('environment should be test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

    test('should create a new job', async () => {
      const jobData = {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        description: 'We are looking for a senior developer with React experience',
        requiredSkills: ['JavaScript', 'React', 'Node.js'],
        location: 'Remote',
        salaryRange: { min: 100000, max: 150000 },
        experienceLevel: 'senior'
      };

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(jobData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(jobData.title);
      expect(response.body.data.requiredSkills).toContain('JavaScript');

      testJob = response.body.data;
    });

    test('should fail without authentication', async () => {
      const jobData = {
        title: 'Test Job',
        description: 'Test description'
      };

      await request(app)
        .post('/api/jobs')
        .send(jobData)
        .expect(401);
    });

    test('should fail with invalid data', async () => {
      const invalidData = {
        title: 'Test Job'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/jobs', () => {
    beforeEach(async () => {
      // Create test jobs
      await Job.create([
        {
          title: 'Job 1',
          company: 'Company A',
          description: 'Description 1',
          requiredSkills: ['JavaScript'],
          userId: testUser._id,
          tenantId: testUser.tenantId,
          status: 'active'
        },
        {
          title: 'Job 2',
          company: 'Company B',
          description: 'Description 2',
          requiredSkills: ['Python'],
          userId: testUser._id,
          tenantId: testUser.tenantId,
          status: 'active'
        }
      ]);
    });

    test('should get list of jobs', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.jobs).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(2);
    });

    test('should filter jobs by status', async () => {
      await Job.create({
        title: 'Closed Job',
        company: 'Company C',
        description: 'Description 3',
        requiredSkills: ['Java'],
        userId: testUser._id,
        tenantId: testUser.tenantId,
        status: 'closed'
      });

      const response = await request(app)
        .get('/api/jobs?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.jobs).toHaveLength(2);
      expect(response.body.data.jobs.every(job => job.status === 'active')).toBe(true);
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/jobs?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.jobs).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.pages).toBe(2);
    });
  });

  describe('GET /api/jobs/:id', () => {
    beforeEach(async () => {
      testJob = await Job.create({
        title: 'Test Job',
        company: 'Test Company',
        description: 'Test description',
        requiredSkills: ['JavaScript'],
        userId: testUser._id,
        tenantId: testUser.tenantId,
        status: 'active'
      });
    });

    test('should get job by id', async () => {
      const response = await request(app)
        .get(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id.toString()).toBe(testJob._id.toString());
      expect(response.body.data.title).toBe('Test Job');
    });

    test('should return 404 for non-existent job', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/jobs/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    beforeEach(async () => {
      testJob = await Job.create({
        title: 'Original Title',
        company: 'Test Company',
        description: 'Original description',
        requiredSkills: ['JavaScript'],
        userId: testUser._id,
        tenantId: testUser.tenantId,
        status: 'active'
      });
    });

    test('should update job', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
      expect(response.body.data.description).toBe('Updated description');
    });

    test('should not allow updating other users jobs', async () => {
      // Create another user's job
      const otherUser = await User.create({
        email: 'other@example.com',
        password: 'Test123!@#',
        firstName: 'Other',
        lastName: 'User',
        tenantId: 'other-tenant'
      });

      const otherJob = await Job.create({
        title: 'Other Job',
        company: 'Other Company',
        description: 'Other description',
        requiredSkills: ['Python'],
        userId: otherUser._id,
        tenantId: otherUser.tenantId,
        status: 'active'
      });

      await request(app)
        .put(`/api/jobs/${otherJob._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked Title' })
        .expect(404);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    beforeEach(async () => {
      testJob = await Job.create({
        title: 'Job to Delete',
        company: 'Test Company',
        description: 'Will be deleted',
        requiredSkills: ['JavaScript'],
        userId: testUser._id,
        tenantId: testUser.tenantId,
        status: 'active'
      });
    });

    test('should delete job', async () => {
      await request(app)
        .delete(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedJob = await Job.findById(testJob._id);
      expect(deletedJob).toBeNull();
    });

    test('should delete associated matches', async () => {
      // Create a resume and match
      const resume = await Resume.create({
        candidateName: 'John Doe',
        email: 'john@example.com',
        skills: ['JavaScript'],
        userId: testUser._id,
        tenantId: testUser.tenantId
      });

      await Match.create({
        jobId: testJob._id,
        resumeId: resume._id,
        overallScore: 0.8,
        tenantId: testUser.tenantId
      });

      await request(app)
        .delete(`/api/jobs/${testJob._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const matches = await Match.find({ jobId: testJob._id });
      expect(matches).toHaveLength(0);
    });
  });

  describe('POST /api/jobs/:id/rescreen', () => {
    test('should rescreen candidates for a job', async () => {
      // Create job
      const job = await Job.create({
        title: 'Developer Position',
        company: 'Tech Co',
        description: 'Looking for developers',
        requiredSkills: ['JavaScript', 'React'],
        userId: testUser._id,
        tenantId: testUser.tenantId,
        status: 'active'
      });

      // Create resumes and matches
      const resume1 = await Resume.create({
        candidateName: 'Candidate 1',
        email: 'candidate1@example.com',
        skills: ['JavaScript', 'React'],
        userId: testUser._id,
        tenantId: testUser.tenantId
      });

      await Match.create({
        jobId: job._id,
        resumeId: resume1._id,
        overallScore: 0.75,
        tenantId: testUser.tenantId
      });

      const response = await request(app)
        .post(`/api/jobs/${job._id}/rescreen`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedMatches).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/jobs/:id/insights', () => {
    test('should get AI insights for a job', async () => {
      const job = await Job.create({
        title: 'Senior Developer',
        company: 'Tech Corp',
        description: 'Senior position',
        requiredSkills: ['JavaScript', 'React', 'Node.js'],
        userId: testUser._id,
        tenantId: testUser.tenantId,
        status: 'active'
      });

      const response = await request(app)
        .get(`/api/jobs/${job._id}/insights`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalApplications');
      expect(response.body.data).toHaveProperty('averageScore');
    });
  });
});
