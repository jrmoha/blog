CREATE TABLE IF NOT EXISTS users (
	username VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	birth_date DATE NOT NULL,
	reg_date DATE NOT NULL DEFAULT CURRENT_DATE,
	PRIMARY KEY (username),
	UNIQUE (email)
);
CREATE TABLE IF NOT EXISTS inbox(
	inbox_id SERIAL NOT NULL,
	username1 VARCHAR(255) NOT NULL,
	username2 VARCHAR(255) NOT NULL,
	last_message VARCHAR(600) NOT NULL,
	last_message_time TIMESTAMP NOT NULL DEFAULT NOW(),
	created_at DATE NOT NULL DEFAULT CURRENT_DATE,
	PRIMARY KEY (inbox_id),
	FOREIGN KEY (username1) REFERENCES users(username),
	FOREIGN KEY (username2) REFERENCES users(username)
	);
CREATE TABLE IF NOT EXISTS message(
	message_id SERIAL NOT NULL,
	inbox_id SERIAL NOT NULL,
	sender_username VARCHAR(255) NOT NULL,
	receiver_username VARCHAR(255) NOT NULL,
	message VARCHAR(600) NOT NULL,
	sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY (message_id),
	FOREIGN KEY (inbox_id) REFERENCES inbox(inbox_id),
	FOREIGN KEY (sender_username) REFERENCES users(username),
	FOREIGN KEY (receiver_username) REFERENCES users(username)
);
CREATE TABLE IF NOT EXISTS provider(
	provider_id VARCHAR(255) NOT NULL,
	provider_name VARCHAR(255) NOT NULL,
	username VARCHAR(255) NOT NULL,
	PRIMARY KEY (provider_id),
	FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS follow(
	followed_username VARCHAR(255) NOT NULL,
	follower_username VARCHAR(255) NOT NULL,
	follow_status INT NOT NULL DEFAULT 1,
	PRIMARY KEY (followed_username, follower_username),
	FOREIGN KEY (followed_username) REFERENCES users(username) ON DELETE CASCADE,
	FOREIGN KEY (follower_username) REFERENCES users(username) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_image(
	username VARCHAR(255) NOT NULL,
	img_src VARCHAR(600) NOT NULL,
	FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);CREATE TABLE IF NOT EXISTS user_search(
	username VARCHAR(255) NOT NULL,
	search VARCHAR(255) NOT NULL,
	search_date TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE
);CREATE TABLE IF NOT EXISTS activity(
	username VARCHAR(255) NOT NULL,
	activity VARCHAR(255) NOT NULL,
	activity_date TIMESTAMP NOT NULL DEFAULT NOW(),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE
);CREATE TABLE IF NOT EXISTS options(
	username VARCHAR(255) NOT NULL,
	gender VARCHAR(50),
	phone VARCHAR(255),
	address VARCHAR(255),
	show_status BOOLEAN NOT NULL DEFAULT TRUE,
	show_last_seen BOOLEAN NOT NULL DEFAULT TRUE,
	bio VARCHAR(600),
	PRIMARY KEY (username),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE
);CREATE TABLE IF NOT EXISTS post(
	post_id BIGSERIAL NOT NULL,
	username VARCHAR(255) NOT NULL,
	upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
	update_date DATE NOT NULL DEFAULT CURRENT_DATE,
	post_content VARCHAR(600) NOT NULL,
	PRIMARY KEY (post_id),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE
);CREATE TABLE IF NOT EXISTS post_images(
	post_id BIGSERIAL NOT NULL,
	img_src VARCHAR(600) NOT NULL,
	FOREIGN KEY (post_id) REFERENCES post(post_id)ON DELETE CASCADE
);CREATE TABLE IF NOT EXISTS post_tags(
	post_id BIGSERIAL NOT NULL,
	tag VARCHAR(255) NOT NULL,
	FOREIGN KEY (post_id) REFERENCES post(post_id)ON DELETE CASCADE
);CREATE TABLE IF NOT EXISTS post_like(
	username VARCHAR(255) NOT NULL,
	post_id BIGSERIAL NOT NULL,
	PRIMARY KEY (username, post_id),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE,
	FOREIGN KEY (post_id) REFERENCES post(post_id)ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS post_comment(
	comment_id BIGSERIAL NOT NULL,
	username VARCHAR(255) NOT NULL,
	post_id BIGSERIAL NOT NULL,
	comment_content VARCHAR(600) NOT NULL,
	comment_time TIMESTAMP NOT NULL DEFAULT NOW(),
	update_time TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY (comment_id),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE,
	FOREIGN KEY (post_id) REFERENCES post(post_id)ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS view_post(
	username VARCHAR(255) NOT NULL,
	post_id BIGSERIAL NOT NULL,
	view_date TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY (username, post_id,view_date),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE,
	FOREIGN KEY (post_id) REFERENCES post(post_id)ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_session(
	session_id VARCHAR(255) NOT NULL,
	username VARCHAR(255) NOT NULL,
	ip_address VARCHAR(255),
	login_time TIMESTAMP NOT NULL DEFAULT NOW(),
	update_time TIMESTAMP NOT NULL DEFAULT NOW(),
	PRIMARY KEY (session_id),
	FOREIGN KEY (username) REFERENCES users(username)ON DELETE CASCADE
);
