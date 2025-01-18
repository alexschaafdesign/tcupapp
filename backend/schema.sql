--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Homebrew)
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: get_special_venues(); Type: FUNCTION; Schema: public; Owner: aschaaf
--

CREATE FUNCTION public.get_special_venues() RETURNS TABLE(venue character varying, cover_image text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE NOTICE 'Function being executed';
    RETURN QUERY
    SELECT v.venue,
           CASE 
               WHEN v.venue = 'Xcel Energy Center' THEN 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1734880040/xcelenergy_ubscbb.jpg'::text
               WHEN v.venue = 'The Fitzgerald Theater' THEN 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1734880040/fitzgerald_prifme.jpg'::text
               WHEN v.venue = 'State Theatre' THEN 'https://res.cloudinary.com/dsll3ms2c/image/upload/v1734880040/state_znvtby.jpg'::text
               ELSE v.cover_image
           END as cover_image
    FROM public.venues v
    WHERE v.venue IN ('Xcel Energy Center', 'The Fitzgerald Theater', 'State Theatre');
END;
$$;


ALTER FUNCTION public.get_special_venues() OWNER TO aschaaf;

--
-- Name: mark_venue_shows_deleted(integer); Type: FUNCTION; Schema: public; Owner: aschaaf
--

CREATE FUNCTION public.mark_venue_shows_deleted(venue_id_param integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE shows 
    SET is_deleted = TRUE 
    WHERE venue_id = venue_id_param 
    AND is_deleted = FALSE;
END;
$$;


ALTER FUNCTION public.mark_venue_shows_deleted(venue_id_param integer) OWNER TO aschaaf;

--
-- Name: set_default_time_for_pilllar(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_default_time_for_pilllar() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if the venue is 'Pilllar' and the time is NULL
  IF NEW.venue = 'Pilllar' AND NEW.time IS NULL THEN
    -- Set the time to '18:30:00' (6:30 PM)
    NEW.time := '18:30:00';
  END IF;
  -- Return the modified row
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_default_time_for_pilllar() OWNER TO postgres;

--
-- Name: update_start_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_start_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Combine date and time into the 'start' column
  NEW.start := TO_TIMESTAMP(NEW.date || ' ' || NEW.time, 'YYYY-MM-DD HH24:MI:SS');
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_start_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: shows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shows (
    event_link character varying(1000),
    flyer_image text,
    id integer NOT NULL,
    start timestamp without time zone,
    venue_id integer,
    bands character varying(1000),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false
);


ALTER TABLE public.shows OWNER TO postgres;

--
-- Name: Show Calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Show Calendar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Show Calendar_id_seq" OWNER TO postgres;

--
-- Name: Show Calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Show Calendar_id_seq" OWNED BY public.shows.id;


--
-- Name: band_images; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.band_images (
    id integer NOT NULL,
    band_id integer NOT NULL,
    image_path text NOT NULL,
    is_profile boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.band_images OWNER TO aschaaf;

--
-- Name: band_images_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.band_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.band_images_id_seq OWNER TO aschaaf;

--
-- Name: band_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.band_images_id_seq OWNED BY public.band_images.id;


--
-- Name: bands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bands (
    id integer NOT NULL,
    band character varying(255) NOT NULL,
    social_links jsonb,
    show_id integer,
    genre text,
    contact text,
    open_to_requests boolean DEFAULT false,
    band_size text,
    claimed_by text,
    claimed_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.bands OWNER TO postgres;

--
-- Name: bands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bands_id_seq OWNER TO postgres;

--
-- Name: bands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bands_id_seq OWNED BY public.bands.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    band_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.favorites OWNER TO aschaaf;

--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favorites_id_seq OWNER TO aschaaf;

--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO aschaaf;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_id_seq OWNER TO aschaaf;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO aschaaf;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNER TO aschaaf;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: session_musicians; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.session_musicians (
    id integer NOT NULL,
    name character varying(100),
    first_instrument character varying(100),
    second_instrument character varying(100),
    third_instrument character varying(100),
    primary_styles text,
    location character varying(100),
    contact_info character varying(255),
    website_samples text
);


ALTER TABLE public.session_musicians OWNER TO aschaaf;

--
-- Name: musicians_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.musicians_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.musicians_id_seq OWNER TO aschaaf;

--
-- Name: musicians_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.musicians_id_seq OWNED BY public.session_musicians.id;


--
-- Name: people; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.people (
    id integer NOT NULL,
    name text NOT NULL,
    email text,
    bio text,
    profile_photo text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.people OWNER TO postgres;

--
-- Name: people_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.people_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.people_id_seq OWNER TO postgres;

--
-- Name: people_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.people_id_seq OWNED BY public.people.id;


--
-- Name: peoplebands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.peoplebands (
    id integer NOT NULL,
    person_id integer,
    band_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.peoplebands OWNER TO postgres;

--
-- Name: peoplebands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.peoplebands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.peoplebands_id_seq OWNER TO postgres;

--
-- Name: peoplebands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.peoplebands_id_seq OWNED BY public.peoplebands.id;


--
-- Name: pledges; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.pledges (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    bands character varying(255),
    signature_url text,
    photo_url text,
    final_image_url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pledges OWNER TO aschaaf;

--
-- Name: pledges_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.pledges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pledges_id_seq OWNER TO aschaaf;

--
-- Name: pledges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.pledges_id_seq OWNED BY public.pledges.id;


--
-- Name: show_bands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.show_bands (
    show_id integer NOT NULL,
    band_id integer NOT NULL
);


ALTER TABLE public.show_bands OWNER TO postgres;

--
-- Name: tcupbands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tcupbands (
    id integer NOT NULL,
    name text NOT NULL,
    social_links jsonb,
    genre text[],
    bandemail text,
    play_shows character varying(20),
    group_size text[] DEFAULT ARRAY[]::text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    music_links jsonb,
    profile_image text,
    other_images text[],
    location text,
    bio text,
    slug character varying(255) NOT NULL,
    claimed_by text,
    claimed_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);


ALTER TABLE public.tcupbands OWNER TO postgres;

--
-- Name: tcupbands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tcupbands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tcupbands_id_seq OWNER TO postgres;

--
-- Name: tcupbands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tcupbands_id_seq OWNED BY public.tcupbands.id;


--
-- Name: user_shows; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.user_shows (
    id integer NOT NULL,
    user_id integer,
    show_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_shows OWNER TO aschaaf;

--
-- Name: user_shows_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.user_shows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_shows_id_seq OWNER TO aschaaf;

--
-- Name: user_shows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.user_shows_id_seq OWNED BY public.user_shows.id;


--
-- Name: user_tcupbands; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.user_tcupbands (
    id integer NOT NULL,
    user_id integer,
    tcupband_id integer,
    relationship_type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_tcupbands OWNER TO aschaaf;

--
-- Name: user_tcupbands_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.user_tcupbands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_tcupbands_id_seq OWNER TO aschaaf;

--
-- Name: user_tcupbands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.user_tcupbands_id_seq OWNED BY public.user_tcupbands.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.users (
    id integer NOT NULL,
    auth0_id character varying(255) NOT NULL,
    username character varying(255),
    avatar_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email text
);


ALTER TABLE public.users OWNER TO aschaaf;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO aschaaf;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: venues; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.venues (
    id integer NOT NULL,
    venue character varying(100),
    location character varying(150),
    capacity text,
    cover_image text,
    contact text,
    notes text,
    parking text,
    accessibility text,
    owner text,
    rating text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.venues OWNER TO aschaaf;

--
-- Name: venues_new_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

ALTER TABLE public.venues ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.venues_new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: vrc_drafts; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.vrc_drafts (
    id integer NOT NULL,
    user_id text NOT NULL,
    venue_id integer,
    form_data jsonb NOT NULL,
    last_modified timestamp with time zone DEFAULT now(),
    completed boolean DEFAULT false
);


ALTER TABLE public.vrc_drafts OWNER TO aschaaf;

--
-- Name: vrc_drafts_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.vrc_drafts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vrc_drafts_id_seq OWNER TO aschaaf;

--
-- Name: vrc_drafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.vrc_drafts_id_seq OWNED BY public.vrc_drafts.id;


--
-- Name: vrc_results; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.vrc_results (
    id integer NOT NULL,
    venue_id integer,
    submitted_by text,
    submission_date timestamp with time zone DEFAULT now(),
    num_bands integer,
    band_size integer,
    attendance integer,
    ticket_price numeric(6,2),
    ticket_counts_communicated boolean,
    num_comp_tickets integer,
    is_event_series boolean,
    event_series_name text,
    payment_amount text,
    payment_rating numeric,
    payment_structure text,
    payment_structure_known_beforehand boolean,
    paid_day_of_show boolean,
    financial_breakdown_provided boolean,
    payment_notes text,
    mgmt_communication_rating numeric,
    booking_method text,
    booker_name text,
    venue_promoted_show boolean,
    felt_respected boolean,
    has_radius_clause boolean,
    radius_clause_details text,
    merch_cut_taken boolean,
    merch_cut_percentage numeric(4,1),
    mgmt_notes text,
    safety_rating numeric,
    has_security boolean,
    felt_comfortable boolean,
    experienced_discrimination boolean,
    discrimination_details text,
    wants_followup boolean,
    safety_notes text,
    sound_rating numeric,
    house_gear_condition text,
    gear_storage_available boolean,
    sound_notes text,
    hospitality_rating numeric,
    drink_tickets_provided boolean,
    green_room_available boolean,
    food_provided boolean,
    hospitality_notes text,
    overall_rating numeric,
    would_play_again boolean,
    would_recommend boolean,
    improvement_suggestions text,
    overall_notes text,
    submitter_name text,
    submitter_email text,
    submitter_phone text,
    is_touring_musician boolean,
    would_return_to_mn boolean,
    ok_to_contact boolean,
    is_anonymous boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    last_modified timestamp with time zone DEFAULT now(),
    date_of_performance timestamp with time zone,
    CONSTRAINT vrc_results_hospitality_rating_check CHECK (((hospitality_rating >= (1)::numeric) AND (hospitality_rating <= (5)::numeric))),
    CONSTRAINT vrc_results_mgmt_communication_rating_check CHECK (((mgmt_communication_rating >= (1)::numeric) AND (mgmt_communication_rating <= (5)::numeric))),
    CONSTRAINT vrc_results_overall_rating_check CHECK (((overall_rating >= (1)::numeric) AND (overall_rating <= (5)::numeric))),
    CONSTRAINT vrc_results_payment_rating_check CHECK (((payment_rating >= (1)::numeric) AND (payment_rating <= (5)::numeric))),
    CONSTRAINT vrc_results_safety_rating_check CHECK (((safety_rating >= (1)::numeric) AND (safety_rating <= (5)::numeric))),
    CONSTRAINT vrc_results_sound_rating_check CHECK (((sound_rating >= (1)::numeric) AND (sound_rating <= (5)::numeric)))
);


ALTER TABLE public.vrc_results OWNER TO aschaaf;

--
-- Name: vrc_results_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.vrc_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vrc_results_id_seq OWNER TO aschaaf;

--
-- Name: vrc_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.vrc_results_id_seq OWNED BY public.vrc_results.id;


--
-- Name: band_images id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.band_images ALTER COLUMN id SET DEFAULT nextval('public.band_images_id_seq'::regclass);


--
-- Name: bands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bands ALTER COLUMN id SET DEFAULT nextval('public.bands_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: people id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people ALTER COLUMN id SET DEFAULT nextval('public.people_id_seq'::regclass);


--
-- Name: peoplebands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peoplebands ALTER COLUMN id SET DEFAULT nextval('public.peoplebands_id_seq'::regclass);


--
-- Name: pledges id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.pledges ALTER COLUMN id SET DEFAULT nextval('public.pledges_id_seq'::regclass);


--
-- Name: session_musicians id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.session_musicians ALTER COLUMN id SET DEFAULT nextval('public.musicians_id_seq'::regclass);


--
-- Name: shows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shows ALTER COLUMN id SET DEFAULT nextval('public."Show Calendar_id_seq"'::regclass);


--
-- Name: tcupbands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcupbands ALTER COLUMN id SET DEFAULT nextval('public.tcupbands_id_seq'::regclass);


--
-- Name: user_shows id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_shows ALTER COLUMN id SET DEFAULT nextval('public.user_shows_id_seq'::regclass);


--
-- Name: user_tcupbands id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_tcupbands ALTER COLUMN id SET DEFAULT nextval('public.user_tcupbands_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vrc_drafts id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.vrc_drafts ALTER COLUMN id SET DEFAULT nextval('public.vrc_drafts_id_seq'::regclass);


--
-- Name: vrc_results id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.vrc_results ALTER COLUMN id SET DEFAULT nextval('public.vrc_results_id_seq'::regclass);


--
-- Name: shows Show Calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shows
    ADD CONSTRAINT "Show Calendar_pkey" PRIMARY KEY (id);


--
-- Name: band_images band_images_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.band_images
    ADD CONSTRAINT band_images_pkey PRIMARY KEY (id);


--
-- Name: bands bands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT bands_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_user_id_band_id_key; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_band_id_key UNIQUE (user_id, band_id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: session_musicians musicians_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.session_musicians
    ADD CONSTRAINT musicians_pkey PRIMARY KEY (id);


--
-- Name: people people_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_email_key UNIQUE (email);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: peoplebands peoplebands_person_id_band_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_person_id_band_id_key UNIQUE (person_id, band_id);


--
-- Name: peoplebands peoplebands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_pkey PRIMARY KEY (id);


--
-- Name: pledges pledges_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.pledges
    ADD CONSTRAINT pledges_pkey PRIMARY KEY (id);


--
-- Name: show_bands show_bands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.show_bands
    ADD CONSTRAINT show_bands_pkey PRIMARY KEY (show_id, band_id);


--
-- Name: tcupbands tcupbands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcupbands
    ADD CONSTRAINT tcupbands_pkey PRIMARY KEY (id);


--
-- Name: tcupbands tcupbands_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcupbands
    ADD CONSTRAINT tcupbands_slug_key UNIQUE (slug);


--
-- Name: tcupbands tcupbands_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcupbands
    ADD CONSTRAINT tcupbands_slug_unique UNIQUE (slug);


--
-- Name: bands unique_band; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT unique_band UNIQUE (band);


--
-- Name: shows unique_show; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shows
    ADD CONSTRAINT unique_show UNIQUE (venue_id, start);


--
-- Name: user_shows user_shows_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_shows
    ADD CONSTRAINT user_shows_pkey PRIMARY KEY (id);


--
-- Name: user_shows user_shows_user_id_show_id_key; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_shows
    ADD CONSTRAINT user_shows_user_id_show_id_key UNIQUE (user_id, show_id);


--
-- Name: user_tcupbands user_tcupbands_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_tcupbands
    ADD CONSTRAINT user_tcupbands_pkey PRIMARY KEY (id);


--
-- Name: user_tcupbands user_tcupbands_user_id_tcupband_id_relationship_type_key; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_tcupbands
    ADD CONSTRAINT user_tcupbands_user_id_tcupband_id_relationship_type_key UNIQUE (user_id, tcupband_id, relationship_type);


--
-- Name: users users_auth0_id_key; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth0_id_key UNIQUE (auth0_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: venues venues_new_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_new_pkey PRIMARY KEY (id);


--
-- Name: vrc_drafts vrc_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.vrc_drafts
    ADD CONSTRAINT vrc_drafts_pkey PRIMARY KEY (id);


--
-- Name: vrc_results vrc_results_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.vrc_results
    ADD CONSTRAINT vrc_results_pkey PRIMARY KEY (id);


--
-- Name: idx_bands_claimed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bands_claimed_by ON public.bands USING btree (claimed_by);


--
-- Name: idx_shows_is_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shows_is_deleted ON public.shows USING btree (is_deleted);


--
-- Name: idx_tcupbands_claimed_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tcupbands_claimed_by ON public.tcupbands USING btree (claimed_by);


--
-- Name: unique_profile_image_per_band; Type: INDEX; Schema: public; Owner: aschaaf
--

CREATE UNIQUE INDEX unique_profile_image_per_band ON public.band_images USING btree (band_id) WHERE (is_profile = true);


--
-- Name: shows set_pilllar_default_time; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_pilllar_default_time BEFORE INSERT ON public.shows FOR EACH ROW EXECUTE FUNCTION public.set_default_time_for_pilllar();

ALTER TABLE public.shows DISABLE TRIGGER set_pilllar_default_time;


--
-- Name: shows set_start_column; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_start_column BEFORE INSERT ON public.shows FOR EACH ROW EXECUTE FUNCTION public.update_start_column();

ALTER TABLE public.shows DISABLE TRIGGER set_start_column;


--
-- Name: bands bands_claimed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT bands_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.users(auth0_id);


--
-- Name: favorites favorites_band_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.tcupbands(id) ON DELETE CASCADE;


--
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: band_images fk_band_images_band; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.band_images
    ADD CONSTRAINT fk_band_images_band FOREIGN KEY (band_id) REFERENCES public.tcupbands(id) ON DELETE CASCADE;


--
-- Name: bands fk_bands_shows; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT fk_bands_shows FOREIGN KEY (show_id) REFERENCES public.shows(id) ON DELETE CASCADE;


--
-- Name: peoplebands peoplebands_band_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: peoplebands peoplebands_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: show_bands show_bands_band_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.show_bands
    ADD CONSTRAINT show_bands_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: show_bands show_bands_show_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.show_bands
    ADD CONSTRAINT show_bands_show_id_fkey FOREIGN KEY (show_id) REFERENCES public.shows(id) ON DELETE CASCADE;


--
-- Name: tcupbands tcupbands_claimed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcupbands
    ADD CONSTRAINT tcupbands_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES public.users(auth0_id);


--
-- Name: user_shows user_shows_show_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_shows
    ADD CONSTRAINT user_shows_show_id_fkey FOREIGN KEY (show_id) REFERENCES public.shows(id);


--
-- Name: user_shows user_shows_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_shows
    ADD CONSTRAINT user_shows_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_tcupbands user_tcupbands_tcupband_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_tcupbands
    ADD CONSTRAINT user_tcupbands_tcupband_id_fkey FOREIGN KEY (tcupband_id) REFERENCES public.tcupbands(id);


--
-- Name: user_tcupbands user_tcupbands_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.user_tcupbands
    ADD CONSTRAINT user_tcupbands_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vrc_results vrc_results_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.vrc_results
    ADD CONSTRAINT vrc_results_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venues(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO aschaaf;


--
-- Name: TABLE shows; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shows TO aschaaf;


--
-- Name: SEQUENCE "Show Calendar_id_seq"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public."Show Calendar_id_seq" TO aschaaf;


--
-- Name: TABLE bands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.bands TO aschaaf;


--
-- Name: SEQUENCE bands_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bands_id_seq TO aschaaf;


--
-- Name: TABLE people; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.people TO aschaaf;


--
-- Name: SEQUENCE people_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.people_id_seq TO aschaaf;


--
-- Name: TABLE peoplebands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.peoplebands TO aschaaf;


--
-- Name: SEQUENCE peoplebands_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.peoplebands_id_seq TO aschaaf;


--
-- Name: TABLE show_bands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.show_bands TO aschaaf;


--
-- Name: TABLE tcupbands; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tcupbands TO aschaaf;


--
-- Name: SEQUENCE tcupbands_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tcupbands_id_seq TO aschaaf;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: musicdaddy
--

ALTER DEFAULT PRIVILEGES FOR ROLE musicdaddy IN SCHEMA public GRANT ALL ON SEQUENCES TO aschaaf;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: musicdaddy
--

ALTER DEFAULT PRIVILEGES FOR ROLE musicdaddy IN SCHEMA public GRANT ALL ON TABLES TO aschaaf;


--
-- PostgreSQL database dump complete
--

