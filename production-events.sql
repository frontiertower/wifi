-- SQL script to populate production database with all events
-- Run this in the Replit Database pane for your production database

-- Clear existing events (optional - remove this line if you want to keep existing events)
-- DELETE FROM events;

-- Insert all events
INSERT INTO events (name, code, description, start_date, end_date, is_active, max_attendees, current_attendees) VALUES
('Tech Conference 2025', 'TECH2025', 'Annual technology conference', '2025-10-28 00:00:00', '2025-10-29 00:00:00', true, 100, 0),
('Startup Meetup', 'STARTUP2025', 'Monthly startup networking event', '2025-10-28 00:00:00', '2025-10-28 00:00:00', true, 50, 0),
('Holistic Massage with Carmen Una', 'MASSAGE2025', 'Holistic massage sessions by Carmen Una', '2025-10-28 09:00:00', '2025-10-28 15:00:00', true, 20, 0),
('CYBER SECURITY & CRYPTOGRAPHY', 'CYBERSEC2025', 'Building Custom Cryptography — From Primitives to Practice', '2025-10-28 17:30:00', '2025-10-28 20:30:00', true, 250, 0),
('Trick or Treat Your Mind', 'TRICKORMIND2025', 'Pop-up by Soma - test your brain with cognitive tricks', '2025-10-28 18:00:00', '2025-10-28 20:00:00', true, 50, 0),
('Build Jam: Collaborative Playground for Builders', 'BUILDJAM2025', 'Hands-on creative sprint for SaaS founders and builders', '2025-10-29 14:00:00', '2025-10-29 18:00:00', true, 50, 0),
('Tarot 101: Learn to Read the Signs', 'TAROT2025', 'Tarot workshop for UX and PM leads in consumer', '2025-10-29 18:00:00', '2025-10-29 21:00:00', true, 50, 0),
('Weekly Meditation Session', 'MEDITATION2025', 'Weekly meditation for citizens and guests', '2025-10-29 11:00:00', '2025-10-29 12:00:00', true, 30, 0),
('Experiment 2025', 'EXPERIMENT2025', 'Un-conference for real-world lessons in building and deploying production-grade AI', '2025-10-30 09:00:00', '2025-10-30 13:00:00', true, 800, 0),
('How can government help advance robotics and AI?', 'ROBOTICS2025', 'Q&A with 2026 California Gubernatorial Candidate Zoltan Istvan', '2025-10-30 16:00:00', '2025-10-30 20:30:00', true, 100, 0),
('Blood on the FrontierTower', 'BLOODCLOCK2025', 'Beginners Friendly Blood on the Clocktower game night', '2025-10-30 18:00:00', '2025-10-30 21:30:00', true, 20, 0),
('Intellectual Salon @ Frontier SF', 'INTELLECT2025', 'Gathering of inquisitive minds for thought-provoking discussions', '2025-10-30 19:00:00', '2025-10-30 21:30:00', true, 50, 0),
('Vibe Coding Night #5', 'VIBECODE5', 'Work on projects, share what you''re building, get unstuck', '2025-10-30 18:00:00', '2025-10-30 22:00:00', true, 50, 0),
('Scar-up: Halloween Makeup Workshop', 'SCARUP2025', 'Halloween makeup workshop on Health & Longevity floor', '2025-10-31 17:00:00', '2025-10-31 19:00:00', true, 20, 0),
('Introducing Red - Fashion & Halloween Party', 'REDHALLOWEEN2025', 'Fashion and music performance with Mana Siyo', '2025-10-31 20:00:00', '2025-11-01 02:00:00', true, 150, 0),
('MultiDance', 'MULTIDANCE2025', 'Social heartbeat — connection, conversation, and no-judgment dance', '2025-11-01 15:00:00', '2025-11-01 18:00:00', true, 60, 0),
('Sunday Community Activities', 'SUNDAYCOMM2025', 'Heart warming community activities - connection dinner, circling, games', '2025-11-02 17:00:00', '2025-11-02 20:00:00', true, 40, 0),
('AI × Buddhism: A Socratic Dialogue', 'AIBUDDHISM2025', 'Socratic dialogue connecting Buddhist foundations to AI ethics', '2025-11-01 16:00:00', '2025-11-01 18:30:00', true, 50, 0),
('Sober Halloween Singles Event', 'SOBERHALLOWEEN2025', 'Halloween-themed singles event with pumpkin carving and games', '2025-10-31 18:00:00', '2025-10-31 21:00:00', true, 30, 0),
('Towards AGI - Qualia Waves & Experiential Intelligence', 'AGI2025', 'Salon on new path to machine general intelligence', '2025-11-01 17:00:00', '2025-11-01 19:00:00', true, 50, 0),
('Right Brain Activation for Quantum Imagination', 'RIGHTBRAIN2025', 'Quantum hypnosis-guided experience for creative problem solving', '2025-11-02 14:00:00', '2025-11-02 17:00:00', true, 30, 0),
('MCP Night - Enterprise Themed', 'MCPNIGHT2025', 'Community of MCP builders showcasing tools from UI to Security', '2025-11-02 18:00:00', '2025-11-02 21:00:00', true, 60, 0),
('The Present Moment Game', 'PRESENTMOMENT2025', 'Hour-long social meditation experience for full presence', '2025-11-03 19:00:00', '2025-11-03 20:45:00', true, 40, 0),
('The Central Dogma of Molecular Biology', 'CENTRALDOGMA2025', 'DNA: Replication, Transcription, and Gene Regulation workshop', '2025-11-04 18:00:00', '2025-11-04 20:00:00', true, 40, 0),
('Soundgasm experience @ Frontier Tower', 'SOUNDBATH2025', 'Rooftop sound bath session with Shane Thunder', '2025-11-07 18:00:00', '2025-11-07 19:30:00', true, 30, 0),
('World Folk Jam', 'WORLDFOLK2025', 'Global folk music celebration with renowned artists', '2025-11-08 20:00:00', '2025-11-09 02:00:00', true, 200, 0),
('Freezestylin', 'FREEZESTYLIN2025', 'Creativity workshop using voice and freestyle for innovation', '2025-11-10 19:00:00', '2025-11-10 21:00:00', true, 40, 0)
ON CONFLICT (code) DO NOTHING;

-- Verify the import
SELECT COUNT(*) as total_events FROM events;
SELECT name, code, start_date FROM events ORDER BY start_date LIMIT 10;
