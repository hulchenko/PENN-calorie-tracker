-- Users
CREATE TABLE users (user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name VARCHAR(50) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL, password VARCHAR(100) NOT NULL);

-- Daily Goals
CREATE TABLE daily_goals (id SERIAL PRIMARY KEY, day_id UUID NOT NULL, user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, date DATE NOT NULL, calorie_target INT NOT NULL, calories_consumed INT DEFAULT 0, goal_met BOOLEAN DEFAULT false);
ALTER TABLE daily_goals ADD CONSTRAINT unique_user_date UNIQUE (user_id, date); -- allow only 1 user and 1 day combination

-- Weekly Summary
CREATE TABLE weekly_summary (week_id SERIAL PRIMARY KEY, user_id UUID REFERENCES users(user_id) ON DELETE CASCADE, start_date DATE NOT NULL, end_date DATE NOT NULL, daily_goals_met INT DEFAULT 0);

-- Meals
CREATE TABLE meals (id SERIAL PRIMARY KEY, meal_id UUID NOT NULL UNIQUE, day_id UUID NOT NULL, meal_type VARCHAR(100) NOT NULL, meal_description VARCHAR(255) NOT NULL, calories NUMERIC NOT NULL, items JSONB);
ALTER TABLE meals ADD COLUMN user_id UUID REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE meals ADD CONSTRAINT unique_meal_id UNIQUE (day_id, meal_id);