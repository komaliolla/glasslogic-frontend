-- =============================================================
--  GlassLogic v2.0  –  MySQL Schema
--  Test database – NOT production data
-- =============================================================

CREATE DATABASE IF NOT EXISTS glasslogic_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE glasslogic_test;

-- -----------------------------------------------------------
--  CUSTOMERS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id          INT            NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)   NOT NULL,
  company     VARCHAR(100)   NOT NULL DEFAULT '',
  route       VARCHAR(50)    NOT NULL DEFAULT '',
  phone       VARCHAR(20)    NOT NULL DEFAULT '',
  address     VARCHAR(200)   NOT NULL DEFAULT '',
  created_at  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
--  BUSINESS TYPES
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_types (
  id    INT           NOT NULL AUTO_INCREMENT,
  name  VARCHAR(100)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_business_type_name (name)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
--  DISCOUNTS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS discounts (
  id           INT            NOT NULL AUTO_INCREMENT,
  code         VARCHAR(20)    NOT NULL,
  name         VARCHAR(100)   NOT NULL,
  edi          TINYINT(1)     NOT NULL DEFAULT 0,
  edi_format   VARCHAR(80)    NOT NULL DEFAULT '',
  kit_charge   TINYINT(1)     NOT NULL DEFAULT 0,
  kit_amt      DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  two_kit_amt  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  high_mod_amt DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  high_mod_nc15 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  high_mod_nc20 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  UNIQUE KEY uq_discount_code (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS discount_details (
  id            INT            NOT NULL AUTO_INCREMENT,
  discount_id   INT            NOT NULL,
  nags_prefix   VARCHAR(10)    NOT NULL DEFAULT '',
  part_type     VARCHAR(30)    NOT NULL,
  flat_or_hourly ENUM('Flat','Hourly') NOT NULL DEFAULT 'Flat',
  discount_pct  DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
  labor         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  min_hours     DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
  max_hours     DECIMAL(5,2)   NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  CONSTRAINT fk_dd_discount FOREIGN KEY (discount_id)
    REFERENCES discounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
--  VEHICLE MAKES
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_makes (
  id    INT          NOT NULL AUTO_INCREMENT,
  code  VARCHAR(10)  NOT NULL,
  name  VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_make_code (code)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
--  VEHICLE MODELS
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_models (
  id       INT          NOT NULL AUTO_INCREMENT,
  make_id  INT          NOT NULL,
  code     VARCHAR(10)  NOT NULL,
  name     VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_model_make FOREIGN KEY (make_id)
    REFERENCES vehicle_makes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
--  BODY STYLES
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_styles (
  id           INT          NOT NULL AUTO_INCREMENT,
  code         VARCHAR(10)  NOT NULL,
  description  VARCHAR(80)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_body_style_code (code)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS glass_parts (
  part_no      VARCHAR(20)    NOT NULL,
  description  VARCHAR(100)   NOT NULL,
  type         ENUM('Windshield','Tempered','Laminated') NOT NULL,
  labor_hours  DECIMAL(4,1)   NOT NULL DEFAULT 0.0,
  list_price   DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  PRIMARY KEY (part_no)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS glass_colors (
  code         VARCHAR(5)    NOT NULL,
  description  VARCHAR(60)   NOT NULL,
  tier         TINYINT       NOT NULL DEFAULT 1,
  PRIMARY KEY (code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS color_price_tiers (
  color_code        VARCHAR(5)     NOT NULL,
  color_name        VARCHAR(60)    NOT NULL,
  labor_hours       DECIMAL(4,1)   NOT NULL DEFAULT 2.0,
  price_multiplier  DECIMAL(5,4)   NOT NULL DEFAULT 1.0000,
  PRIMARY KEY (color_code)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS hardware_parts (
  part_no      VARCHAR(20)   NOT NULL,
  color        VARCHAR(30)   NOT NULL DEFAULT '',
  type         VARCHAR(30)   NOT NULL,
  description  VARCHAR(100)  NOT NULL,
  PRIMARY KEY (part_no)
) ENGINE=InnoDB;
