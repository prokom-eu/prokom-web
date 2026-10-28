import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inst_services_key" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum_inst_services_group" AS ENUM('security', 'networks', 'comfort');
  CREATE TYPE "public"."enum_inst_services_offer_family" AS ENUM('security', 'connectivity', 'comfort', 'emobility');
  CREATE TYPE "public"."enum_inst_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__inst_services_v_version_key" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum__inst_services_v_version_group" AS ENUM('security', 'networks', 'comfort');
  CREATE TYPE "public"."enum__inst_services_v_version_offer_family" AS ENUM('security', 'connectivity', 'comfort', 'emobility');
  CREATE TYPE "public"."enum__inst_services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_inst_objects_problems_service" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum_inst_objects_day_services" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum_inst_objects_key" AS ENUM('dom', 'apt', 'pens', 'hotel', 'rest', 'sklep', 'firma', 'kosc', 'szk', 'gmina', 'dev', 'bud');
  CREATE TYPE "public"."enum_inst_objects_group" AS ENUM('homes', 'business', 'institutions', 'construction');
  CREATE TYPE "public"."enum_inst_objects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__inst_objects_v_version_problems_service" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum__inst_objects_v_version_day_services" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum__inst_objects_v_version_key" AS ENUM('dom', 'apt', 'pens', 'hotel', 'rest', 'sklep', 'firma', 'kosc', 'szk', 'gmina', 'dev', 'bud');
  CREATE TYPE "public"."enum__inst_objects_v_version_group" AS ENUM('homes', 'business', 'institutions', 'construction');
  CREATE TYPE "public"."enum__inst_objects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_inst_solutions_categories" AS ENUM('dom', 'apt', 'pens', 'rest', 'sklep', 'firma', 'inst', 'dev');
  CREATE TYPE "public"."enum_inst_solutions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__inst_solutions_v_version_categories" AS ENUM('dom', 'apt', 'pens', 'rest', 'sklep', 'firma', 'inst', 'dev');
  CREATE TYPE "public"."enum__inst_solutions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_realizations_services" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum_realizations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__realizations_v_version_services" AS ENUM('kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'smart', 'snd', 'scr', 'ev');
  CREATE TYPE "public"."enum__realizations_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "instalacje_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"show_prices" boolean DEFAULT false,
  	"no_price_text" varchar DEFAULT 'Wycena po wizji lokalnej' NOT NULL,
  	"warranty_months" numeric DEFAULT 24 NOT NULL,
  	"whatsapp" varchar,
  	"response_text" varchar DEFAULT 'Do 24 h odpowiadamy na zgłoszenia w dni robocze.' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inst_services_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "inst_services_anchors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "inst_services_packages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" varchar,
  	"description" varchar,
  	"price" varchar,
  	"badge" varchar,
  	"featured" boolean DEFAULT false
  );
  
  CREATE TABLE "inst_services_price_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "inst_services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "inst_services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"key" "enum_inst_services_key",
  	"slug" varchar,
  	"name" varchar,
  	"group" "enum_inst_services_group",
  	"icon" varchar,
  	"color" varchar,
  	"menu_caption" varchar,
  	"tile_description" varchar,
  	"tile_parts" varchar,
  	"tile_price_from" varchar,
  	"tile_wide" boolean DEFAULT false,
  	"offer_family" "enum_inst_services_offer_family",
  	"offer_description" varchar,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"packages_intro_eyebrow" varchar,
  	"packages_intro_heading" varchar,
  	"packages_intro_text" varchar,
  	"packages_intro_note" varchar,
  	"price_intro_eyebrow" varchar,
  	"price_intro_heading" varchar,
  	"price_intro_text" varchar,
  	"price_intro_button" varchar,
  	"faq_heading" varchar,
  	"faq_aside_title" varchar,
  	"faq_aside_text" varchar,
  	"faq_aside_button" varchar,
  	"faq_aside_href" varchar,
  	"related_heading" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_inst_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "inst_services_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "inst_services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"inst_services_id" integer,
  	"inst_objects_id" integer
  );
  
  CREATE TABLE "_inst_services_v_version_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_services_v_version_anchors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_services_v_version_packages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" varchar,
  	"description" varchar,
  	"price" varchar,
  	"badge" varchar,
  	"featured" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_services_v_version_price_factors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_services_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_key" "enum__inst_services_v_version_key",
  	"version_slug" varchar,
  	"version_name" varchar,
  	"version_group" "enum__inst_services_v_version_group",
  	"version_icon" varchar,
  	"version_color" varchar,
  	"version_menu_caption" varchar,
  	"version_tile_description" varchar,
  	"version_tile_parts" varchar,
  	"version_tile_price_from" varchar,
  	"version_tile_wide" boolean DEFAULT false,
  	"version_offer_family" "enum__inst_services_v_version_offer_family",
  	"version_offer_description" varchar,
  	"version_hero_crumb" varchar,
  	"version_hero_eyebrow" varchar,
  	"version_hero_h1a" varchar,
  	"version_hero_h1b" varchar,
  	"version_hero_lead" varchar,
  	"version_hero_cta_text" varchar,
  	"version_hero_cta_href" varchar,
  	"version_packages_intro_eyebrow" varchar,
  	"version_packages_intro_heading" varchar,
  	"version_packages_intro_text" varchar,
  	"version_packages_intro_note" varchar,
  	"version_price_intro_eyebrow" varchar,
  	"version_price_intro_heading" varchar,
  	"version_price_intro_text" varchar,
  	"version_price_intro_button" varchar,
  	"version_faq_heading" varchar,
  	"version_faq_aside_title" varchar,
  	"version_faq_aside_text" varchar,
  	"version_faq_aside_button" varchar,
  	"version_faq_aside_href" varchar,
  	"version_related_heading" varchar,
  	"version_cta_eyebrow" varchar,
  	"version_cta_heading" varchar,
  	"version_cta_text" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__inst_services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_inst_services_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_inst_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"inst_services_id" integer,
  	"inst_objects_id" integer
  );
  
  CREATE TABLE "inst_objects_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "inst_objects_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "inst_objects_anchors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "inst_objects_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"description" varchar,
  	"fix" varchar,
  	"service" "enum_inst_objects_problems_service",
  	"icon" varchar
  );
  
  CREATE TABLE "inst_objects_day_services" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_inst_objects_day_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "inst_objects_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"name" varchar,
  	"description" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "inst_objects_law" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"who" varchar,
  	"article" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "inst_objects_mountains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "inst_objects_realizations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"place" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "inst_objects_packages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" varchar,
  	"description" varchar,
  	"price" varchar,
  	"badge" varchar,
  	"featured" boolean DEFAULT false
  );
  
  CREATE TABLE "inst_objects_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "inst_objects_fold_on_phone" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"max_height" numeric
  );
  
  CREATE TABLE "inst_objects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"key" "enum_inst_objects_key",
  	"slug" varchar,
  	"name" varchar,
  	"group" "enum_inst_objects_group",
  	"icon" varchar,
  	"color" varchar,
  	"menu_caption" varchar,
  	"for_whom" varchar,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"scene_title" varchar,
  	"problems_intro_eyebrow" varchar,
  	"problems_intro_heading" varchar,
  	"problems_intro_text" varchar,
  	"problems_intro_heading_accent" varchar,
  	"day_intro_eyebrow" varchar,
  	"day_intro_heading" varchar,
  	"day_intro_text" varchar,
  	"law_intro_eyebrow" varchar,
  	"law_intro_heading" varchar,
  	"law_intro_text" varchar,
  	"mountains_intro_eyebrow" varchar,
  	"mountains_intro_heading" varchar,
  	"mountains_intro_text" varchar,
  	"realizations_heading" varchar,
  	"prepare_intro_eyebrow" varchar,
  	"prepare_intro_heading" varchar,
  	"prepare_intro_text" varchar,
  	"packages_heading" varchar,
  	"faq_heading" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_inst_objects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "inst_objects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "inst_objects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"inst_services_id" integer
  );
  
  CREATE TABLE "_inst_objects_v_version_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_anchors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"description" varchar,
  	"fix" varchar,
  	"service" "enum__inst_objects_v_version_problems_service",
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_day_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__inst_objects_v_version_day_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_inst_objects_v_version_day" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"name" varchar,
  	"description" varchar,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_law" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"who" varchar,
  	"article" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_mountains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_realizations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"place" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_packages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" varchar,
  	"description" varchar,
  	"price" varchar,
  	"badge" varchar,
  	"featured" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v_version_fold_on_phone" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"max_height" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_objects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_key" "enum__inst_objects_v_version_key",
  	"version_slug" varchar,
  	"version_name" varchar,
  	"version_group" "enum__inst_objects_v_version_group",
  	"version_icon" varchar,
  	"version_color" varchar,
  	"version_menu_caption" varchar,
  	"version_for_whom" varchar,
  	"version_hero_crumb" varchar,
  	"version_hero_eyebrow" varchar,
  	"version_hero_h1a" varchar,
  	"version_hero_h1b" varchar,
  	"version_hero_lead" varchar,
  	"version_hero_cta_text" varchar,
  	"version_hero_cta_href" varchar,
  	"version_scene_title" varchar,
  	"version_problems_intro_eyebrow" varchar,
  	"version_problems_intro_heading" varchar,
  	"version_problems_intro_text" varchar,
  	"version_problems_intro_heading_accent" varchar,
  	"version_day_intro_eyebrow" varchar,
  	"version_day_intro_heading" varchar,
  	"version_day_intro_text" varchar,
  	"version_law_intro_eyebrow" varchar,
  	"version_law_intro_heading" varchar,
  	"version_law_intro_text" varchar,
  	"version_mountains_intro_eyebrow" varchar,
  	"version_mountains_intro_heading" varchar,
  	"version_mountains_intro_text" varchar,
  	"version_realizations_heading" varchar,
  	"version_prepare_intro_eyebrow" varchar,
  	"version_prepare_intro_heading" varchar,
  	"version_prepare_intro_text" varchar,
  	"version_packages_heading" varchar,
  	"version_faq_heading" varchar,
  	"version_cta_eyebrow" varchar,
  	"version_cta_heading" varchar,
  	"version_cta_text" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__inst_objects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_inst_objects_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_inst_objects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"inst_services_id" integer
  );
  
  CREATE TABLE "inst_solutions_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_inst_solutions_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "inst_solutions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"legacy_id" numeric,
  	"name" varchar,
  	"description" varchar,
  	"service_id" integer,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_inst_solutions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_inst_solutions_v_version_categories" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__inst_solutions_v_version_categories",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_inst_solutions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_legacy_id" numeric,
  	"version_name" varchar,
  	"version_description" varchar,
  	"version_service_id" integer,
  	"version_order" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__inst_solutions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "realizations_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_realizations_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "realizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"legacy_id" numeric,
  	"client_consent" boolean DEFAULT false,
  	"featured" boolean DEFAULT false,
  	"title" varchar,
  	"category" varchar,
  	"year" numeric,
  	"place" varchar,
  	"scope" varchar,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_realizations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "realizations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_realizations_v_version_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__realizations_v_version_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_realizations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_legacy_id" numeric,
  	"version_client_consent" boolean DEFAULT false,
  	"version_featured" boolean DEFAULT false,
  	"version_title" varchar,
  	"version_category" varchar,
  	"version_year" numeric,
  	"version_place" varchar,
  	"version_scope" varchar,
  	"version_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__realizations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_realizations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instalacje_settings_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inst_services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inst_objects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inst_solutions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "realizations_id" integer;
  ALTER TABLE "instalacje_settings" ADD CONSTRAINT "instalacje_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inst_services_hero_facts" ADD CONSTRAINT "inst_services_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services_anchors" ADD CONSTRAINT "inst_services_anchors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services_packages" ADD CONSTRAINT "inst_services_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services_price_factors" ADD CONSTRAINT "inst_services_price_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services_faq" ADD CONSTRAINT "inst_services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services" ADD CONSTRAINT "inst_services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inst_services_texts" ADD CONSTRAINT "inst_services_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services_rels" ADD CONSTRAINT "inst_services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services_rels" ADD CONSTRAINT "inst_services_rels_inst_services_fk" FOREIGN KEY ("inst_services_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_services_rels" ADD CONSTRAINT "inst_services_rels_inst_objects_fk" FOREIGN KEY ("inst_objects_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_version_hero_facts" ADD CONSTRAINT "_inst_services_v_version_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_version_anchors" ADD CONSTRAINT "_inst_services_v_version_anchors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_version_packages" ADD CONSTRAINT "_inst_services_v_version_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_version_price_factors" ADD CONSTRAINT "_inst_services_v_version_price_factors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_version_faq" ADD CONSTRAINT "_inst_services_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v" ADD CONSTRAINT "_inst_services_v_parent_id_inst_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_services_v" ADD CONSTRAINT "_inst_services_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_services_v_texts" ADD CONSTRAINT "_inst_services_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_inst_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_rels" ADD CONSTRAINT "_inst_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_inst_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_rels" ADD CONSTRAINT "_inst_services_v_rels_inst_services_fk" FOREIGN KEY ("inst_services_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_services_v_rels" ADD CONSTRAINT "_inst_services_v_rels_inst_objects_fk" FOREIGN KEY ("inst_objects_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_hero_facts" ADD CONSTRAINT "inst_objects_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_hotspots" ADD CONSTRAINT "inst_objects_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_anchors" ADD CONSTRAINT "inst_objects_anchors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_problems" ADD CONSTRAINT "inst_objects_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_day_services" ADD CONSTRAINT "inst_objects_day_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_objects_day"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_day" ADD CONSTRAINT "inst_objects_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_law" ADD CONSTRAINT "inst_objects_law_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_mountains" ADD CONSTRAINT "inst_objects_mountains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_realizations" ADD CONSTRAINT "inst_objects_realizations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_packages" ADD CONSTRAINT "inst_objects_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_faq" ADD CONSTRAINT "inst_objects_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_fold_on_phone" ADD CONSTRAINT "inst_objects_fold_on_phone_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects" ADD CONSTRAINT "inst_objects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inst_objects_texts" ADD CONSTRAINT "inst_objects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_rels" ADD CONSTRAINT "inst_objects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_objects_rels" ADD CONSTRAINT "inst_objects_rels_inst_services_fk" FOREIGN KEY ("inst_services_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_hero_facts" ADD CONSTRAINT "_inst_objects_v_version_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_hotspots" ADD CONSTRAINT "_inst_objects_v_version_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_anchors" ADD CONSTRAINT "_inst_objects_v_version_anchors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_problems" ADD CONSTRAINT "_inst_objects_v_version_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_day_services" ADD CONSTRAINT "_inst_objects_v_version_day_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_inst_objects_v_version_day"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_day" ADD CONSTRAINT "_inst_objects_v_version_day_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_law" ADD CONSTRAINT "_inst_objects_v_version_law_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_mountains" ADD CONSTRAINT "_inst_objects_v_version_mountains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_realizations" ADD CONSTRAINT "_inst_objects_v_version_realizations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_packages" ADD CONSTRAINT "_inst_objects_v_version_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_faq" ADD CONSTRAINT "_inst_objects_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_version_fold_on_phone" ADD CONSTRAINT "_inst_objects_v_version_fold_on_phone_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v" ADD CONSTRAINT "_inst_objects_v_parent_id_inst_objects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_objects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_objects_v" ADD CONSTRAINT "_inst_objects_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_texts" ADD CONSTRAINT "_inst_objects_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_rels" ADD CONSTRAINT "_inst_objects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_inst_objects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_objects_v_rels" ADD CONSTRAINT "_inst_objects_v_rels_inst_services_fk" FOREIGN KEY ("inst_services_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_solutions_categories" ADD CONSTRAINT "inst_solutions_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_solutions" ADD CONSTRAINT "inst_solutions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inst_solutions" ADD CONSTRAINT "inst_solutions_service_id_inst_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."inst_services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_solutions_v_version_categories" ADD CONSTRAINT "_inst_solutions_v_version_categories_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_inst_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_solutions_v" ADD CONSTRAINT "_inst_solutions_v_parent_id_inst_solutions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_solutions_v" ADD CONSTRAINT "_inst_solutions_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_solutions_v" ADD CONSTRAINT "_inst_solutions_v_version_service_id_inst_services_id_fk" FOREIGN KEY ("version_service_id") REFERENCES "public"."inst_services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realizations_services" ADD CONSTRAINT "realizations_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."realizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realizations" ADD CONSTRAINT "realizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "realizations_rels" ADD CONSTRAINT "realizations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."realizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "realizations_rels" ADD CONSTRAINT "realizations_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realizations_v_version_services" ADD CONSTRAINT "_realizations_v_version_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_realizations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realizations_v" ADD CONSTRAINT "_realizations_v_parent_id_realizations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."realizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realizations_v" ADD CONSTRAINT "_realizations_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_realizations_v_rels" ADD CONSTRAINT "_realizations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_realizations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_realizations_v_rels" ADD CONSTRAINT "_realizations_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "instalacje_settings_tenant_idx" ON "instalacje_settings" USING btree ("tenant_id");
  CREATE INDEX "instalacje_settings_updated_at_idx" ON "instalacje_settings" USING btree ("updated_at");
  CREATE INDEX "instalacje_settings_created_at_idx" ON "instalacje_settings" USING btree ("created_at");
  CREATE INDEX "inst_services_hero_facts_order_idx" ON "inst_services_hero_facts" USING btree ("_order");
  CREATE INDEX "inst_services_hero_facts_parent_id_idx" ON "inst_services_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "inst_services_anchors_order_idx" ON "inst_services_anchors" USING btree ("_order");
  CREATE INDEX "inst_services_anchors_parent_id_idx" ON "inst_services_anchors" USING btree ("_parent_id");
  CREATE INDEX "inst_services_packages_order_idx" ON "inst_services_packages" USING btree ("_order");
  CREATE INDEX "inst_services_packages_parent_id_idx" ON "inst_services_packages" USING btree ("_parent_id");
  CREATE INDEX "inst_services_price_factors_order_idx" ON "inst_services_price_factors" USING btree ("_order");
  CREATE INDEX "inst_services_price_factors_parent_id_idx" ON "inst_services_price_factors" USING btree ("_parent_id");
  CREATE INDEX "inst_services_faq_order_idx" ON "inst_services_faq" USING btree ("_order");
  CREATE INDEX "inst_services_faq_parent_id_idx" ON "inst_services_faq" USING btree ("_parent_id");
  CREATE INDEX "inst_services_tenant_idx" ON "inst_services" USING btree ("tenant_id");
  CREATE INDEX "inst_services_updated_at_idx" ON "inst_services" USING btree ("updated_at");
  CREATE INDEX "inst_services_created_at_idx" ON "inst_services" USING btree ("created_at");
  CREATE INDEX "inst_services__status_idx" ON "inst_services" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_9_idx" ON "inst_services" USING btree ("tenant_id","slug");
  CREATE UNIQUE INDEX "tenant_key_1_idx" ON "inst_services" USING btree ("tenant_id","key");
  CREATE INDEX "inst_services_texts_order_parent" ON "inst_services_texts" USING btree ("order","parent_id");
  CREATE INDEX "inst_services_rels_order_idx" ON "inst_services_rels" USING btree ("order");
  CREATE INDEX "inst_services_rels_parent_idx" ON "inst_services_rels" USING btree ("parent_id");
  CREATE INDEX "inst_services_rels_path_idx" ON "inst_services_rels" USING btree ("path");
  CREATE INDEX "inst_services_rels_inst_services_id_idx" ON "inst_services_rels" USING btree ("inst_services_id");
  CREATE INDEX "inst_services_rels_inst_objects_id_idx" ON "inst_services_rels" USING btree ("inst_objects_id");
  CREATE INDEX "_inst_services_v_version_hero_facts_order_idx" ON "_inst_services_v_version_hero_facts" USING btree ("_order");
  CREATE INDEX "_inst_services_v_version_hero_facts_parent_id_idx" ON "_inst_services_v_version_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_inst_services_v_version_anchors_order_idx" ON "_inst_services_v_version_anchors" USING btree ("_order");
  CREATE INDEX "_inst_services_v_version_anchors_parent_id_idx" ON "_inst_services_v_version_anchors" USING btree ("_parent_id");
  CREATE INDEX "_inst_services_v_version_packages_order_idx" ON "_inst_services_v_version_packages" USING btree ("_order");
  CREATE INDEX "_inst_services_v_version_packages_parent_id_idx" ON "_inst_services_v_version_packages" USING btree ("_parent_id");
  CREATE INDEX "_inst_services_v_version_price_factors_order_idx" ON "_inst_services_v_version_price_factors" USING btree ("_order");
  CREATE INDEX "_inst_services_v_version_price_factors_parent_id_idx" ON "_inst_services_v_version_price_factors" USING btree ("_parent_id");
  CREATE INDEX "_inst_services_v_version_faq_order_idx" ON "_inst_services_v_version_faq" USING btree ("_order");
  CREATE INDEX "_inst_services_v_version_faq_parent_id_idx" ON "_inst_services_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_inst_services_v_parent_idx" ON "_inst_services_v" USING btree ("parent_id");
  CREATE INDEX "_inst_services_v_version_version_tenant_idx" ON "_inst_services_v" USING btree ("version_tenant_id");
  CREATE INDEX "_inst_services_v_version_version_updated_at_idx" ON "_inst_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_inst_services_v_version_version_created_at_idx" ON "_inst_services_v" USING btree ("version_created_at");
  CREATE INDEX "_inst_services_v_version_version__status_idx" ON "_inst_services_v" USING btree ("version__status");
  CREATE INDEX "_inst_services_v_created_at_idx" ON "_inst_services_v" USING btree ("created_at");
  CREATE INDEX "_inst_services_v_updated_at_idx" ON "_inst_services_v" USING btree ("updated_at");
  CREATE INDEX "_inst_services_v_latest_idx" ON "_inst_services_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_4_idx" ON "_inst_services_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "version_tenant_version_key_idx" ON "_inst_services_v" USING btree ("version_tenant_id","version_key");
  CREATE INDEX "_inst_services_v_texts_order_parent" ON "_inst_services_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_inst_services_v_rels_order_idx" ON "_inst_services_v_rels" USING btree ("order");
  CREATE INDEX "_inst_services_v_rels_parent_idx" ON "_inst_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_inst_services_v_rels_path_idx" ON "_inst_services_v_rels" USING btree ("path");
  CREATE INDEX "_inst_services_v_rels_inst_services_id_idx" ON "_inst_services_v_rels" USING btree ("inst_services_id");
  CREATE INDEX "_inst_services_v_rels_inst_objects_id_idx" ON "_inst_services_v_rels" USING btree ("inst_objects_id");
  CREATE INDEX "inst_objects_hero_facts_order_idx" ON "inst_objects_hero_facts" USING btree ("_order");
  CREATE INDEX "inst_objects_hero_facts_parent_id_idx" ON "inst_objects_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_hotspots_order_idx" ON "inst_objects_hotspots" USING btree ("_order");
  CREATE INDEX "inst_objects_hotspots_parent_id_idx" ON "inst_objects_hotspots" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_anchors_order_idx" ON "inst_objects_anchors" USING btree ("_order");
  CREATE INDEX "inst_objects_anchors_parent_id_idx" ON "inst_objects_anchors" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_problems_order_idx" ON "inst_objects_problems" USING btree ("_order");
  CREATE INDEX "inst_objects_problems_parent_id_idx" ON "inst_objects_problems" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_day_services_order_idx" ON "inst_objects_day_services" USING btree ("order");
  CREATE INDEX "inst_objects_day_services_parent_idx" ON "inst_objects_day_services" USING btree ("parent_id");
  CREATE INDEX "inst_objects_day_order_idx" ON "inst_objects_day" USING btree ("_order");
  CREATE INDEX "inst_objects_day_parent_id_idx" ON "inst_objects_day" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_law_order_idx" ON "inst_objects_law" USING btree ("_order");
  CREATE INDEX "inst_objects_law_parent_id_idx" ON "inst_objects_law" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_mountains_order_idx" ON "inst_objects_mountains" USING btree ("_order");
  CREATE INDEX "inst_objects_mountains_parent_id_idx" ON "inst_objects_mountains" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_realizations_order_idx" ON "inst_objects_realizations" USING btree ("_order");
  CREATE INDEX "inst_objects_realizations_parent_id_idx" ON "inst_objects_realizations" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_packages_order_idx" ON "inst_objects_packages" USING btree ("_order");
  CREATE INDEX "inst_objects_packages_parent_id_idx" ON "inst_objects_packages" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_faq_order_idx" ON "inst_objects_faq" USING btree ("_order");
  CREATE INDEX "inst_objects_faq_parent_id_idx" ON "inst_objects_faq" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_fold_on_phone_order_idx" ON "inst_objects_fold_on_phone" USING btree ("_order");
  CREATE INDEX "inst_objects_fold_on_phone_parent_id_idx" ON "inst_objects_fold_on_phone" USING btree ("_parent_id");
  CREATE INDEX "inst_objects_tenant_idx" ON "inst_objects" USING btree ("tenant_id");
  CREATE INDEX "inst_objects_updated_at_idx" ON "inst_objects" USING btree ("updated_at");
  CREATE INDEX "inst_objects_created_at_idx" ON "inst_objects" USING btree ("created_at");
  CREATE INDEX "inst_objects__status_idx" ON "inst_objects" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_10_idx" ON "inst_objects" USING btree ("tenant_id","slug");
  CREATE UNIQUE INDEX "tenant_key_2_idx" ON "inst_objects" USING btree ("tenant_id","key");
  CREATE INDEX "inst_objects_texts_order_parent" ON "inst_objects_texts" USING btree ("order","parent_id");
  CREATE INDEX "inst_objects_rels_order_idx" ON "inst_objects_rels" USING btree ("order");
  CREATE INDEX "inst_objects_rels_parent_idx" ON "inst_objects_rels" USING btree ("parent_id");
  CREATE INDEX "inst_objects_rels_path_idx" ON "inst_objects_rels" USING btree ("path");
  CREATE INDEX "inst_objects_rels_inst_services_id_idx" ON "inst_objects_rels" USING btree ("inst_services_id");
  CREATE INDEX "_inst_objects_v_version_hero_facts_order_idx" ON "_inst_objects_v_version_hero_facts" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_hero_facts_parent_id_idx" ON "_inst_objects_v_version_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_hotspots_order_idx" ON "_inst_objects_v_version_hotspots" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_hotspots_parent_id_idx" ON "_inst_objects_v_version_hotspots" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_anchors_order_idx" ON "_inst_objects_v_version_anchors" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_anchors_parent_id_idx" ON "_inst_objects_v_version_anchors" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_problems_order_idx" ON "_inst_objects_v_version_problems" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_problems_parent_id_idx" ON "_inst_objects_v_version_problems" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_day_services_order_idx" ON "_inst_objects_v_version_day_services" USING btree ("order");
  CREATE INDEX "_inst_objects_v_version_day_services_parent_idx" ON "_inst_objects_v_version_day_services" USING btree ("parent_id");
  CREATE INDEX "_inst_objects_v_version_day_order_idx" ON "_inst_objects_v_version_day" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_day_parent_id_idx" ON "_inst_objects_v_version_day" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_law_order_idx" ON "_inst_objects_v_version_law" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_law_parent_id_idx" ON "_inst_objects_v_version_law" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_mountains_order_idx" ON "_inst_objects_v_version_mountains" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_mountains_parent_id_idx" ON "_inst_objects_v_version_mountains" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_realizations_order_idx" ON "_inst_objects_v_version_realizations" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_realizations_parent_id_idx" ON "_inst_objects_v_version_realizations" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_packages_order_idx" ON "_inst_objects_v_version_packages" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_packages_parent_id_idx" ON "_inst_objects_v_version_packages" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_faq_order_idx" ON "_inst_objects_v_version_faq" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_faq_parent_id_idx" ON "_inst_objects_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_version_fold_on_phone_order_idx" ON "_inst_objects_v_version_fold_on_phone" USING btree ("_order");
  CREATE INDEX "_inst_objects_v_version_fold_on_phone_parent_id_idx" ON "_inst_objects_v_version_fold_on_phone" USING btree ("_parent_id");
  CREATE INDEX "_inst_objects_v_parent_idx" ON "_inst_objects_v" USING btree ("parent_id");
  CREATE INDEX "_inst_objects_v_version_version_tenant_idx" ON "_inst_objects_v" USING btree ("version_tenant_id");
  CREATE INDEX "_inst_objects_v_version_version_updated_at_idx" ON "_inst_objects_v" USING btree ("version_updated_at");
  CREATE INDEX "_inst_objects_v_version_version_created_at_idx" ON "_inst_objects_v" USING btree ("version_created_at");
  CREATE INDEX "_inst_objects_v_version_version__status_idx" ON "_inst_objects_v" USING btree ("version__status");
  CREATE INDEX "_inst_objects_v_created_at_idx" ON "_inst_objects_v" USING btree ("created_at");
  CREATE INDEX "_inst_objects_v_updated_at_idx" ON "_inst_objects_v" USING btree ("updated_at");
  CREATE INDEX "_inst_objects_v_latest_idx" ON "_inst_objects_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_5_idx" ON "_inst_objects_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "version_tenant_version_key_1_idx" ON "_inst_objects_v" USING btree ("version_tenant_id","version_key");
  CREATE INDEX "_inst_objects_v_texts_order_parent" ON "_inst_objects_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_inst_objects_v_rels_order_idx" ON "_inst_objects_v_rels" USING btree ("order");
  CREATE INDEX "_inst_objects_v_rels_parent_idx" ON "_inst_objects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_inst_objects_v_rels_path_idx" ON "_inst_objects_v_rels" USING btree ("path");
  CREATE INDEX "_inst_objects_v_rels_inst_services_id_idx" ON "_inst_objects_v_rels" USING btree ("inst_services_id");
  CREATE INDEX "inst_solutions_categories_order_idx" ON "inst_solutions_categories" USING btree ("order");
  CREATE INDEX "inst_solutions_categories_parent_idx" ON "inst_solutions_categories" USING btree ("parent_id");
  CREATE INDEX "inst_solutions_tenant_idx" ON "inst_solutions" USING btree ("tenant_id");
  CREATE INDEX "inst_solutions_service_idx" ON "inst_solutions" USING btree ("service_id");
  CREATE INDEX "inst_solutions_updated_at_idx" ON "inst_solutions" USING btree ("updated_at");
  CREATE INDEX "inst_solutions_created_at_idx" ON "inst_solutions" USING btree ("created_at");
  CREATE INDEX "inst_solutions__status_idx" ON "inst_solutions" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_legacyId_1_idx" ON "inst_solutions" USING btree ("tenant_id","legacy_id");
  CREATE INDEX "_inst_solutions_v_version_categories_order_idx" ON "_inst_solutions_v_version_categories" USING btree ("order");
  CREATE INDEX "_inst_solutions_v_version_categories_parent_idx" ON "_inst_solutions_v_version_categories" USING btree ("parent_id");
  CREATE INDEX "_inst_solutions_v_parent_idx" ON "_inst_solutions_v" USING btree ("parent_id");
  CREATE INDEX "_inst_solutions_v_version_version_tenant_idx" ON "_inst_solutions_v" USING btree ("version_tenant_id");
  CREATE INDEX "_inst_solutions_v_version_version_service_idx" ON "_inst_solutions_v" USING btree ("version_service_id");
  CREATE INDEX "_inst_solutions_v_version_version_updated_at_idx" ON "_inst_solutions_v" USING btree ("version_updated_at");
  CREATE INDEX "_inst_solutions_v_version_version_created_at_idx" ON "_inst_solutions_v" USING btree ("version_created_at");
  CREATE INDEX "_inst_solutions_v_version_version__status_idx" ON "_inst_solutions_v" USING btree ("version__status");
  CREATE INDEX "_inst_solutions_v_created_at_idx" ON "_inst_solutions_v" USING btree ("created_at");
  CREATE INDEX "_inst_solutions_v_updated_at_idx" ON "_inst_solutions_v" USING btree ("updated_at");
  CREATE INDEX "_inst_solutions_v_latest_idx" ON "_inst_solutions_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_legacyId_1_idx" ON "_inst_solutions_v" USING btree ("version_tenant_id","version_legacy_id");
  CREATE INDEX "realizations_services_order_idx" ON "realizations_services" USING btree ("order");
  CREATE INDEX "realizations_services_parent_idx" ON "realizations_services" USING btree ("parent_id");
  CREATE INDEX "realizations_tenant_idx" ON "realizations" USING btree ("tenant_id");
  CREATE INDEX "realizations_updated_at_idx" ON "realizations" USING btree ("updated_at");
  CREATE INDEX "realizations_created_at_idx" ON "realizations" USING btree ("created_at");
  CREATE INDEX "realizations__status_idx" ON "realizations" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_legacyId_2_idx" ON "realizations" USING btree ("tenant_id","legacy_id");
  CREATE INDEX "realizations_rels_order_idx" ON "realizations_rels" USING btree ("order");
  CREATE INDEX "realizations_rels_parent_idx" ON "realizations_rels" USING btree ("parent_id");
  CREATE INDEX "realizations_rels_path_idx" ON "realizations_rels" USING btree ("path");
  CREATE INDEX "realizations_rels_media_id_idx" ON "realizations_rels" USING btree ("media_id");
  CREATE INDEX "_realizations_v_version_services_order_idx" ON "_realizations_v_version_services" USING btree ("order");
  CREATE INDEX "_realizations_v_version_services_parent_idx" ON "_realizations_v_version_services" USING btree ("parent_id");
  CREATE INDEX "_realizations_v_parent_idx" ON "_realizations_v" USING btree ("parent_id");
  CREATE INDEX "_realizations_v_version_version_tenant_idx" ON "_realizations_v" USING btree ("version_tenant_id");
  CREATE INDEX "_realizations_v_version_version_updated_at_idx" ON "_realizations_v" USING btree ("version_updated_at");
  CREATE INDEX "_realizations_v_version_version_created_at_idx" ON "_realizations_v" USING btree ("version_created_at");
  CREATE INDEX "_realizations_v_version_version__status_idx" ON "_realizations_v" USING btree ("version__status");
  CREATE INDEX "_realizations_v_created_at_idx" ON "_realizations_v" USING btree ("created_at");
  CREATE INDEX "_realizations_v_updated_at_idx" ON "_realizations_v" USING btree ("updated_at");
  CREATE INDEX "_realizations_v_latest_idx" ON "_realizations_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_legacyId_2_idx" ON "_realizations_v" USING btree ("version_tenant_id","version_legacy_id");
  CREATE INDEX "_realizations_v_rels_order_idx" ON "_realizations_v_rels" USING btree ("order");
  CREATE INDEX "_realizations_v_rels_parent_idx" ON "_realizations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_realizations_v_rels_path_idx" ON "_realizations_v_rels" USING btree ("path");
  CREATE INDEX "_realizations_v_rels_media_id_idx" ON "_realizations_v_rels" USING btree ("media_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instalacje_settings_fk" FOREIGN KEY ("instalacje_settings_id") REFERENCES "public"."instalacje_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inst_services_fk" FOREIGN KEY ("inst_services_id") REFERENCES "public"."inst_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inst_objects_fk" FOREIGN KEY ("inst_objects_id") REFERENCES "public"."inst_objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inst_solutions_fk" FOREIGN KEY ("inst_solutions_id") REFERENCES "public"."inst_solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_realizations_fk" FOREIGN KEY ("realizations_id") REFERENCES "public"."realizations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_instalacje_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("instalacje_settings_id");
  CREATE INDEX "payload_locked_documents_rels_inst_services_id_idx" ON "payload_locked_documents_rels" USING btree ("inst_services_id");
  CREATE INDEX "payload_locked_documents_rels_inst_objects_id_idx" ON "payload_locked_documents_rels" USING btree ("inst_objects_id");
  CREATE INDEX "payload_locked_documents_rels_inst_solutions_id_idx" ON "payload_locked_documents_rels" USING btree ("inst_solutions_id");
  CREATE INDEX "payload_locked_documents_rels_realizations_id_idx" ON "payload_locked_documents_rels" USING btree ("realizations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instalacje_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services_hero_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services_anchors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services_packages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services_price_factors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v_version_hero_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v_version_anchors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v_version_packages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v_version_price_factors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_services_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_hero_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_hotspots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_anchors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_day_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_day" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_law" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_mountains" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_realizations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_packages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_fold_on_phone" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_objects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_hero_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_hotspots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_anchors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_day_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_day" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_law" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_mountains" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_realizations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_packages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_version_fold_on_phone" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_objects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_solutions_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_solutions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_solutions_v_version_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_solutions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "realizations_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "realizations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "realizations_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_realizations_v_version_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_realizations_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_realizations_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "instalacje_settings" CASCADE;
  DROP TABLE "inst_services_hero_facts" CASCADE;
  DROP TABLE "inst_services_anchors" CASCADE;
  DROP TABLE "inst_services_packages" CASCADE;
  DROP TABLE "inst_services_price_factors" CASCADE;
  DROP TABLE "inst_services_faq" CASCADE;
  DROP TABLE "inst_services" CASCADE;
  DROP TABLE "inst_services_texts" CASCADE;
  DROP TABLE "inst_services_rels" CASCADE;
  DROP TABLE "_inst_services_v_version_hero_facts" CASCADE;
  DROP TABLE "_inst_services_v_version_anchors" CASCADE;
  DROP TABLE "_inst_services_v_version_packages" CASCADE;
  DROP TABLE "_inst_services_v_version_price_factors" CASCADE;
  DROP TABLE "_inst_services_v_version_faq" CASCADE;
  DROP TABLE "_inst_services_v" CASCADE;
  DROP TABLE "_inst_services_v_texts" CASCADE;
  DROP TABLE "_inst_services_v_rels" CASCADE;
  DROP TABLE "inst_objects_hero_facts" CASCADE;
  DROP TABLE "inst_objects_hotspots" CASCADE;
  DROP TABLE "inst_objects_anchors" CASCADE;
  DROP TABLE "inst_objects_problems" CASCADE;
  DROP TABLE "inst_objects_day_services" CASCADE;
  DROP TABLE "inst_objects_day" CASCADE;
  DROP TABLE "inst_objects_law" CASCADE;
  DROP TABLE "inst_objects_mountains" CASCADE;
  DROP TABLE "inst_objects_realizations" CASCADE;
  DROP TABLE "inst_objects_packages" CASCADE;
  DROP TABLE "inst_objects_faq" CASCADE;
  DROP TABLE "inst_objects_fold_on_phone" CASCADE;
  DROP TABLE "inst_objects" CASCADE;
  DROP TABLE "inst_objects_texts" CASCADE;
  DROP TABLE "inst_objects_rels" CASCADE;
  DROP TABLE "_inst_objects_v_version_hero_facts" CASCADE;
  DROP TABLE "_inst_objects_v_version_hotspots" CASCADE;
  DROP TABLE "_inst_objects_v_version_anchors" CASCADE;
  DROP TABLE "_inst_objects_v_version_problems" CASCADE;
  DROP TABLE "_inst_objects_v_version_day_services" CASCADE;
  DROP TABLE "_inst_objects_v_version_day" CASCADE;
  DROP TABLE "_inst_objects_v_version_law" CASCADE;
  DROP TABLE "_inst_objects_v_version_mountains" CASCADE;
  DROP TABLE "_inst_objects_v_version_realizations" CASCADE;
  DROP TABLE "_inst_objects_v_version_packages" CASCADE;
  DROP TABLE "_inst_objects_v_version_faq" CASCADE;
  DROP TABLE "_inst_objects_v_version_fold_on_phone" CASCADE;
  DROP TABLE "_inst_objects_v" CASCADE;
  DROP TABLE "_inst_objects_v_texts" CASCADE;
  DROP TABLE "_inst_objects_v_rels" CASCADE;
  DROP TABLE "inst_solutions_categories" CASCADE;
  DROP TABLE "inst_solutions" CASCADE;
  DROP TABLE "_inst_solutions_v_version_categories" CASCADE;
  DROP TABLE "_inst_solutions_v" CASCADE;
  DROP TABLE "realizations_services" CASCADE;
  DROP TABLE "realizations" CASCADE;
  DROP TABLE "realizations_rels" CASCADE;
  DROP TABLE "_realizations_v_version_services" CASCADE;
  DROP TABLE "_realizations_v" CASCADE;
  DROP TABLE "_realizations_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instalacje_settings_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inst_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inst_objects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inst_solutions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_realizations_fk";
  
  DROP INDEX "payload_locked_documents_rels_instalacje_settings_id_idx";
  DROP INDEX "payload_locked_documents_rels_inst_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_inst_objects_id_idx";
  DROP INDEX "payload_locked_documents_rels_inst_solutions_id_idx";
  DROP INDEX "payload_locked_documents_rels_realizations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instalacje_settings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inst_services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inst_objects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inst_solutions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "realizations_id";
  DROP TYPE "public"."enum_inst_services_key";
  DROP TYPE "public"."enum_inst_services_group";
  DROP TYPE "public"."enum_inst_services_offer_family";
  DROP TYPE "public"."enum_inst_services_status";
  DROP TYPE "public"."enum__inst_services_v_version_key";
  DROP TYPE "public"."enum__inst_services_v_version_group";
  DROP TYPE "public"."enum__inst_services_v_version_offer_family";
  DROP TYPE "public"."enum__inst_services_v_version_status";
  DROP TYPE "public"."enum_inst_objects_problems_service";
  DROP TYPE "public"."enum_inst_objects_day_services";
  DROP TYPE "public"."enum_inst_objects_key";
  DROP TYPE "public"."enum_inst_objects_group";
  DROP TYPE "public"."enum_inst_objects_status";
  DROP TYPE "public"."enum__inst_objects_v_version_problems_service";
  DROP TYPE "public"."enum__inst_objects_v_version_day_services";
  DROP TYPE "public"."enum__inst_objects_v_version_key";
  DROP TYPE "public"."enum__inst_objects_v_version_group";
  DROP TYPE "public"."enum__inst_objects_v_version_status";
  DROP TYPE "public"."enum_inst_solutions_categories";
  DROP TYPE "public"."enum_inst_solutions_status";
  DROP TYPE "public"."enum__inst_solutions_v_version_categories";
  DROP TYPE "public"."enum__inst_solutions_v_version_status";
  DROP TYPE "public"."enum_realizations_services";
  DROP TYPE "public"."enum_realizations_status";
  DROP TYPE "public"."enum__realizations_v_version_services";
  DROP TYPE "public"."enum__realizations_v_version_status";`)
}
