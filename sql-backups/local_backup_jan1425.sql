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
-- Data for Name: band_images; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.band_images (id, band_id, image_path, is_profile, created_at) FROM stdin;
3	76	/assets/images/1733614267705-925279273-images (5).jpeg	f	2024-12-07 17:31:07.73223
4	76	/assets/images/1733614394329-545298030-images (5).jpeg	f	2024-12-07 17:33:14.352927
5	76	/assets/images/1733614762223-112578780-images (5).jpeg	f	2024-12-07 17:39:22.231341
6	76	/assets/images/1733614876596-245229022-images (5).jpeg	f	2024-12-07 17:41:16.610759
7	76	/assets/images/1733614898880-864129497-images (5).jpeg	f	2024-12-07 17:41:38.890459
\.


--
-- Data for Name: bands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bands (id, band, social_links, show_id, genre, contact, open_to_requests, band_size, claimed_by, claimed_at) FROM stdin;
1	FarFarAway	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
2	Not Your Baby	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
3	BELLA'S ROOM	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
4	The Customers	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
5	Edith Head	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
6	Bad Idea	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
7	Blame the Witness	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
8	Dead by 50	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
9	Friends	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
10	Rickshaw Billie's Burger Patrol	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
11	Ancient Waves	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
12	Ciao Bello	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
13	13 Howell	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
14	FATHER PARANOIA's "MOON LOGIC" Album Release	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
15	Gleemer	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
16	Extermination Day	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
17	Tribute Night	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
18	The Weeping Covenant	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
19	Wax Appeal feat. E-Tones and The Excavators	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
20	Juice Falls (Indy)	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
21	Lip Critic	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
22	Dashed	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
23	Modern Wildlife	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
24	Nothingness	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
25	Aberration	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
26	Mind Out of Time	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
27	Surrounded by Water Album Release Show	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
28	Waar Party	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
29	Chief Opossum	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
30	Field Hospitals	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
31	Prize Horse	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
32	Sunken Planes	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
33	Betty Won't	\N	\N	\N	\N	f	\N	\N	2025-01-09 14:35:13.724191-06
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.favorites (id, user_id, band_id, created_at) FROM stdin;
8	3	73	2025-01-04 14:45:42.91467
9	226	71	2025-01-08 11:55:22.141678
10	4	71	2025-01-09 09:15:09.103867
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
2	20241209025340_shows.js	1	2024-12-08 21:04:20.19843-06
4	20241209030959_venues.js	1	2024-12-08 21:12:59.258558-06
5	20241209031528_show_bands.js	1	2024-12-08 21:16:08.594226-06
6	20241209031651_band_images.js	1	2024-12-08 21:17:36.37331-06
7	20241209031811_people_bands.js	1	2024-12-08 21:18:40.118045-06
8	20241209031904_people.js	1	2024-12-08 21:19:43.001367-06
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.people (id, name, email, bio, profile_photo, created_at, updated_at) FROM stdin;
1	Alex Schaaf	alex.schaaf@gmail.com	Person of interest	\N	2024-12-04 18:04:46.237483	2024-12-04 18:04:46.237483
\.


--
-- Data for Name: peoplebands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.peoplebands (id, person_id, band_id, created_at) FROM stdin;
\.


--
-- Data for Name: pledges; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.pledges (id, name, bands, signature_url, photo_url, final_image_url, created_at) FROM stdin;
1	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458419/ucfli5vyj0gi4qhdjxpw.jpg	2025-01-09 15:33:40.026202
2	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458436/ctzipqa0xftzlnsivh9n.jpg	2025-01-09 15:33:57.265967
3	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458440/inrp0utgwrlynzzkdieq.jpg	2025-01-09 15:34:00.638808
4	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458455/ujyiuz4ewjonm4de8hzg.jpg	2025-01-09 15:34:16.340593
5	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458463/jciffcf2ixm0h4zxzpzl.jpg	2025-01-09 15:34:23.640405
6	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458466/x7r6joibeg5tfgcdif9p.jpg	2025-01-09 15:34:26.595646
7	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458536/rfdtiwfmhtdhglmv7vix.jpg	2025-01-09 15:35:37.00741
8	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458539/x4lwdg3pkfntdtp5tsko.jpg	2025-01-09 15:35:40.352949
9	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458547/znv7bhghr2l6tpco8qye.jpg	2025-01-09 15:35:48.206689
10	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458567/j1n6tdr5zsrnumvf0inr.jpg	2025-01-09 15:36:07.791939
11	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458577/bqmp320stzibqdb2wlop.jpg	2025-01-09 15:36:17.959971
12	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458583/lvbdamwhydapdsher1kl.jpg	2025-01-09 15:36:23.857193
13	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458587/rrj7lqixhxq3mmamlncw.jpg	2025-01-09 15:36:27.841049
14	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458612/emgvwjfw2dilkwrqdqo8.jpg	2025-01-09 15:36:53.535673
15	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458636/f8j64qdvtnhbflczfcwe.jpg	2025-01-09 15:37:17.270094
16	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458638/wgksqraltgoqgs5ko03z.jpg	2025-01-09 15:37:19.342302
17	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458640/ylante4bfi7mfizaxtwo.jpg	2025-01-09 15:37:21.360397
18	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458720/l9ncms8xv9mi9hw6rpn3.jpg	2025-01-09 15:38:40.768358
19	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458735/pi983v97nyjixfhszmo8.jpg	2025-01-09 15:38:56.233706
20	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458750/fhfmawhbvsl0i6kd04ox.jpg	2025-01-09 15:39:11.375701
21	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458764/qly3iy3pqzxqptmef5i8.jpg	2025-01-09 15:39:24.910928
22	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458774/prcdaj2qfxhdzhthknfa.jpg	2025-01-09 15:39:35.05655
23	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736458824/bcuvpkcbeogd3hzeajvt.jpg	2025-01-09 15:40:25.282326
24	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736459023/hwhqwwvefn0vw62vuhnj.jpg	2025-01-09 15:43:43.90315
25	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736459036/iecofr0binzfxbsyf1xr.jpg	2025-01-09 15:43:56.82347
26	Alex Schaaf	Yellow Ostrich	data:image/png;base64,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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736457823/qjmsugeaeykp6zubctwz.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736459122/hbrkz4huyfzrwj2svnvo.jpg	2025-01-09 15:45:23.627869
27	Alex Schaaf	Yellow Ostrich	data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAr4AAADICAYAAAAOY+KAAAAAAXNSR0IArs4c6QAAG3FJREFUeF7t3d215EYVBlCRAUSAycBEYHjikRDGhOAIDBHYGWBC4JEnmAiYDDAZkAHMMbfsclnqltT6qZ/da7E8zHRLVftU3/5udan0s8mDAAECBAgQIECAwAACPxugj7pIgAABAgQIECBAYBJ8DQICBAgQIECAAIEhBATfIcqskwQIECBAgAABAoKvMUCAAAECBAgQIDCEgOA7RJl1kgABAgQIECBAQPA1BggQIECAAAECBIYQEHyHKLNOEiBAgAABAgQICL7GAAECBAgQIECAwBACgu8QZdZJAgQIECBAgAABwdcYIECAAAECBAgQGEJA8B2izDpJgAABAgQIECAg+BoDBAgQIECAAAECQwgIvkOUWScJECBAgAABAgQEX2OAAAECBAgQIEBgCAHBd4gy6yQBAgQIECBAgIDgawwQIECAAAECBAgMISD4DlFmnSRAgAABAgQIEBB8jQECBAgQIECAAIEhBATfIcqskwQIECBAgAABAoKvMUCAAAECBAgQIDCEgOA7RJl1kgABAgQIECBAQPA1BggQIECAAAECBIYQEHyHKLNOEiBAgAABAgQICL7GAAECBAgQIECAwBACgu8QZdZJAgQIECBAgAABwdcYIECAAAECBAgQGEJA8B2izDpJgAABAgQIECAg+BoDBAgQIECAAAECQwgIvkOUWScJECBAgAABAgQEX2OAAAECBAgQIEBgCAHBd4gy6yQBAgQIECBAgIDgawwQIECAAAECBAgMISD4DlFmnSRAgAABAgQIEBB8jQECBAgQIECAAIEhBATfIcqskwQIECBAgAABAoKvMUCAAAECBAgQIDCEgOA7RJl1kgABAgQIECBAQPA1BggQIECAAAECBIYQEHyHKLNOEiBAgAABAgQICL7GAAECBAgQIECAwBACgu8QZdZJAgQIECBAgAABwdcYIECAAAECBAgQGEJA8B2izDpJgAABAgQIECAg+BoDBAgQIECAAAECQwgIvkOUWScJECBAgAABAgQEX2NgSeA3b/8Q//0jJgIECBAgQIBA6wKCb+sVPL79EXTjf19mh/6T8Hs8tCMSIECAAAEC1woIvtd6t3C2v78F37Ktwm8L1dNGAgQIECBAYFFA8DU4kkDM8kbo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	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736459370/ypmudyvduns7r3ucqbvt.jpg	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736459373/a0cdjiq0neidkksrngfq.jpg	2025-01-09 15:49:34.071612
\.


--
-- Data for Name: session_musicians; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.session_musicians (id, name, first_instrument, second_instrument, third_instrument, primary_styles, location, contact_info, website_samples) FROM stdin;
1	Elijah Deaton-Berg	Bass Guitar	Voice	\N	Rock	St. Paul	elijahkingberg@gmail.com	\N
2	Abe Anderson	Drum kit	Guitar	Bass Guitar	Indie rock, alternative, punk	Stillwater	cloudfactory.abe@gmail.com	https://youtube.com/@cloudfactorysound4335
3	Dan Hughes	Guitar	Bass	Vocals	Neon seoul/Jam Band	London 	info@danhughesmusic.com	https://www.danhughesmusic.com/
4	Sam Klein	Drum set 	Congas 	Cajon 	Rock, Alt-Rock, Funk, Pop, R&B, Hip-Hop, Progressive Rock, Ska, Punk, Math Rock, Post Hardcore, Metalcore 	St. Paul 	Samkleinthd@gmail.com	https://instagram.com/thehuskydrummer?igshid=OGQ5ZDc2ODk2ZA==
5	Nick Larsen 	Drums	\N	\N	Rock, indie, americana, pop, hip hop, blues, soul,  r&b.	Minneapolis 	Nlarsen1@gmail.com	Nixxistix on Instagram, ExactlyNo.com as well as ExactlyNo on Insta, Facebook, and YouTube. Edward The Confessor on all socials, Megan and Shane on all socials as well. 
6	Bridger Fruth	Guitar	Pedal Steel Guitar	Bass Guitar	Rock, Country, Funk, Fusion, Alternative, Experimental, Ambient	Minneapolis	Bridgerfruthmusic@gmail.com	Instagram.com/thisisbridger/
7	Jake Johnson	Violin/fiddle	Guitar	Pedal steel guitar 	Americana, indie, alt-country	Minneapolis 	jake.rwj@gmail.com	@jakerwjohnson on Instagram
8	JT Bates	Drum set	Percussion 	Synthesizer	All styles except Metal 	Minneapolis	Please contact via my website 	www.jtbatesdrums.com
9	Jonah Esty	Bass	Guitar	Keys	Rock, metal, jazz fusion, prog	Minneapolis	jgesty@gmail.com	https://youtube.com/@jonahesty3546
10	Kai Brewster	Guitar	Bass	Keys	Rock, Country, Gospel, R&B	Robbinsdale	Kaibrewstermusic@gmail.com	@kaibrewster on Instagram
11	Torleif Sorenson	Bass	\N	\N	Rock, soul, jazz, general	Saint Paul	torleifsorenson@gmail.com	http://elephantintheroomband.com/wp/?page_id=1092
12	John Potts	Electric or upright bass 	Guitar	Pedal steel, banjo, percussion 	Folk, indie, country, punk, jazz 	Minneapolis 	Jpotts321@gmail.com	https://youtube.com/playlist?list=PLzyoEBAKnvAZ4z37ZymaiNbj8paMSVWx4
13	Satchel Bruna	Drums	Pedal Steel	Guitar	Classic/Psych rock (drums) country/rock (pedal steel)/jazz/rock/alt rock (drums)	Minneapolis	brunasatchel.212@gmail.com	@satcheltunes
14	Bob Beahen	Drums	Anything percussion 	Guitar/bass	Pop, rock, jazz, etc…	Minneapolis	bbeahen@gmail.com	bobbeahen.com
15	Kat Luna	voice 	\N	\N	ANY	Minneapolis 	phone is best, 763-607-2085	spotify
16	Nathan Kinney	Guitar	Bass	Percussion 	Rock, punk, hardcore, metal, ska, soul, funk	Minneapolis	Nathan@rockcampexperience.com	https://m.soundcloud.com/nathan-kinney-600428777
17	Desmond Lawrence	Bass Guitar	Drums	Upright Bass	Rock, Hip Hop, Folk, etc.	Saint Paul	desmond2lawrence@gmail.com	My Album: https://open.spotify.com/album/0LxA1R2samCGvTPStG0bwt?si=Ha62ZTP5RAC6xcee0Ntkvw I played Bass, Drums on all tracks.
18	Tate Schoeberlein	Pedal steel	\N	\N	Country/alt-country/indie	Saint Paul 	tateschoeb@gmail.com	\N
19	Liz  Draper 	Upright bass	Electric bass	\N	Classical, jazz, Americana	Minneapolis 	liz@musiclabminneapolis.com	@lizdraperbass
20	Matt Kirkwold	Guitar	Bass	Vocals 	All styles 	Crystal 	612 327 5487	@matthewkirkwold Instagram
21	Mason Meyers	Saxophone	Flute	\N	Jazz, funk, soul, rock, R&B, ska, hip hop, pop, EDM	Minneapolis	Mason.meyers93@gmail.com	\N
22	Ari Pent	Drumset	Keys	Guitar	Pop, rock, r&b, jazz, funk, hip-hop	Boston/Minneapolis	aripent@gmail.com	https://youtu.be/dnzFsQF18fs
23	Jimmy Bayard	Electric guitar	Acoustic guitar	Bass guitar	Funk, soul, R&B, rock, jazz, blues	Chicago, IL	Jimmybayardlive@gmail.com	Www.jimmybayard.com
24	Cameron Skinner	Guitar	Synthesizer (programming)	\N	Rock, jazz, funk, pop, experimental	Hopkins	cameronskinnermusic@gmail.com	cameronskinner.com
25	Liz DeYoe	Acoustic Guitar	Electric Guitar	\N	Fingerstyle, folk, bluegrass	Minneapolis	Lizdeyoe@gmail.com	Www.lizdeyoe.com, https://youtube.com/@thefoxgloves
26	Joe Finstrom	Cello	Electric bass	\N	Alternative, rock, folk, country	Minneapolis	Joe.finstrom@gmail.com	Vincentvanbeethoven.com
27	Clark Amann	Drums	Producing 	\N	Punk, alt rock, blues, hip-hop, RnB	Minneapolis 	6122141264	https://open.spotify.com/artist/4K1eO4twuSCEip5kDrOCz7?si=zwZZzt2bQOSu1B45YWcCaA
28	Bang Do	Guitar	\N	\N	Rock, Prog Rock, Heavy Metal 	Bloomington 	anbangbtv@gmail.com	https://www.youtube.com/@BangDoMusic
29	Dylan  Heidt	Guitar	Electronic Production	Bass Guitar	R&B, Neo-Soul, Hip-Hop, Reggae 	Minneapolis	prodbylostgold@gmail.com	https://open.spotify.com/playlist/6bYS2kDDyDBOIUO5nUqj7Y?si=HJkWXxZRRpqpX3aMXZ3Uvg
30	BRANDON STEIN	Bass	Drums	Guitar and vocals	Rock punk metal electronic	Minneapolis	steinamic@gmail.com	You got em
31	Ed Draper	Drum Kit	Drum Machine	Electronic Drum	Popular, art, folk	Minneapolis, MN	Draper.ed@gmail.com	www.instagram.com/ed.draper.music
32	Nikki  Lemire	Harp and Pedal Harp 	Vocals (Backing and Lead) 	\N	Pop Folk and Classical 	Minneapolis	Nikki.lemire@gmail.com 	https://youtube.com/@nikkilemire7822; nikkilemiremusic.com; @nikkilemire
33	Maura Dunst	Violin	Mandolin	Backing vox	Americana, folk, bluegrass	St. Paul	mauradunst@gmail.com	\N
34	Serdar G	Guitar	Bass	\N	Blues, Rock, Jazz, Reggae, Soca, Calypso, Turkish	Minneapolis 	Gravitygrooves@yahoo.com	Dredidread.com
35	Bryce  Tuitt	Guitar	Drum kit	\N	Funk, rock, americana, folk, soul, punk	Saint Paul 	\N	Guitar: https://youtu.be/sUyU3O58QMw Drums: https://youtu.be/bB1EOlvUUac
36	Brandon Scott Jacobson	Bass	Acoustic Guitar	Electric Guitar	Basic rock,  alternative rock, folk, jamband, pop.	Minneapolis	Bsjmusicpro@gmail.com	Linktr.ee/bsjmusicpro
37	Dennis Wyatt	Vocals	Guitar	Bass	Hard rock, rock, folk, singer/songwriter, country, bluegrass	Faribault, MN	Denniswyatt@live.com	Linktr.ee/LeavingHope
38	Mark Zoller	Drums	\N	\N	R&B, Roots Rock, folk, Jazz, Hip Hop, funk 	St. Paul	Markzoller115@gmail.com 	https://open.spotify.com/album/5t7d5Ow0vaC6xGBNRZaziS?si=H5foeOgXTWWGRu5NQcF_Ng  https://open.spotify.com/album/0f0whYUhIrtGMb9MXB578R?si=q-w2OuxlQ3KIPrkssoj0Bw   https://golongmule.bandcamp.com/album/albion-2    
39	Ben Davidson	Piano	Guitar	Composition	BAM (black american music)	Minneapolis 	benjamindavidson.composer@gmail.com	Lxnusmusic on ig
40	Dante Leyva	Saxophone	Vocals/Harmonies	Harmonica	Ska, Pop, Indie	Twin Cities	dante.leyva.lundberg@gmail.com mobl	monkeymafia.space
41	Ani Macy	Bass Guitar - 6 String - Fretless	Enough guitar to constitue "rythym guitar"	\N	Punk, Rock, Jazz, Country	St. Paul/Midway	AniLMacy@gmail.com	https://open.spotify.com/track/78XbN9Xrpyy1QQmR6tb1m5?si=E35Hq5WNSTOPRsjghzUiAA
42	Joe Lundy	Guitar	Bass	Drums	Funk, Prog Rock, Classic Rock, Pop, Reggae, Folk, Country	New Brighton, MN/Minneapolis, MN	joelundy@live.com	\N
43	Matt Blake	Bass (mostly upright but also electric)	Cello/Violin (I make string arrangements)	Musical Saw	Jazz, Blues, Folk, Bluegrass, Irish trad, Rock, Pop	Saint Paul	mattblakebass@gmail.com 	\N
44	Max Greene	Drums	\N	\N	Rock, Alt Rock, Hard Rock, Metal	Twin Cities Area	maxgreene98@gmail.com	https://youtu.be/MpvpVs0biYA
45	Peter Kramer 	Bass	Guitar	Keyboards 	Jazz, Funk, Blues, Rock, Americana, hip hop	Minneapolis 	Mr.Peter.kaye@gmail.com	PeterHayward.bandcamp.com @Peter_Hayward_ on Instagram
46	David Robinson	Banjo (3 finger & Clawhammer)	Mandolin	Guitars (Acoustic, Electric, Dobro)	Bluegrass, Country, Folk, Old-Time, Roots, Americana	Minneapolis	davidrobinsonmusician@gmail.com	davidrobinsonmusician.com
47	Joseph Hays	Drums	Guitar	Bass guitar	Rock, pop, R&B, jazz	Minneapolis	joeychays@gmail.com	https://youtu.be/A-4g4AqYHVI  https://youtu.be/0vGXZfgrEOg
48	Adam  Schuda 	Guitar 	Bass	\N	Rock/Americana/Funk/R&B/Blues/Country 	Lakeville 	adamschuda@gmail.com	\N
49	Eric Swanberg	Bass guitar	Keyboard	\N	Ska, indie rock, CCM 	St Paul	eric.swanberg@gmail.com	https://linktr.ee/lostislandsociety
50	Blake Fostee	Guitar	Bass	\N	Rock, funk, R&B, ska, reggae, metal, classic rock, jazz, rockabilly, fingerstyle, acoustic	Saint Paul	blakefoster937@gmail.com	Instagram.com/blakefostermusic 
51	Ryan Garmoe	Trumpet	Keys	\N	Jazz, Funk, Salsa, R&B, Neo-Soul	Minneapolis	ryangarmoemusic@gmail.com	(please contact for a full list) https://open.spotify.com/album/0cvGM7SKs0293poaNGhl3y?si=2_HyOE73TZO0Pr00BVTC8Q
52	Mattie Rynkiewicz	piano	accordion	djembe	Folk, primarily contra dance music	Minneapolis MN	rynkiemusic@outlook.com	https://archive.org/search?query=subject%3A%22Mattie+Rynkiewicz%22
53	Anna Dolde	Alto saxophone	Flute	Bass clarinet	Jazz, indie, rock, funk, folk, pop	Minneapolis	aagdolde@gmail.com	https://rabeca.bandcamp.com/
54	Dan Anderson 	Saxophone	Bass	Woodwind instruments	Funk, Jazz, Blues, Soul, Anything	Minneapolis	dander22@cord.edu	@hunnybearjazz, @olddanandthesea, youtube.com/@hunnybearjazz
55	Gage Schmitt	Saxophone/EWI (Wind synth)	Clarinet	Flute	Classical. Jazz, Funk, rock, R&B, Pop	Minneapolis	gpsmusicandaudio@gmail.com	\N
56	Lewis Williams 	Guitar	Bass	Vocals	Rock, pop, punk rock	Plymouth 	Mtplewis@gmail.com	https://youtube.com/@linus863
57	Elaine Avery	Voice	turntable?	hand drum	I sing all the things. 	Minneapolis	djmisseos@gmail.com	\N
58	Mykl Westbrooks 	Guitar	I’ll try anything	3rd verse same as the first	Indie, alternative, ambient, drone, anything	Minneapolis 	Myklgear@msn.com	\N
59	June Kayfes	Voice	Guitar	Piano	Pop, Folk, Indie, Rock, Alternative, Acoustic, Jazz	St Paul	S.kayfes@gmail.com	https://instagram.com/jxne_kay?igshid=MmIzYWVlNDQ5Yg==
60	Mike Fiato	Bass guitar	Vocals	\N	Rock (alt, prog, indie)	Bloomington	\N	Videos and tracks can be found with Youtube search Destroy the Planet.  On Facebook etc.  I am in two bands - Glass Eyed Brother and Destroy the Planet
61	Olivia  Quintanilla	Cello	Violin	\N	Bluegrass, Americana, hip-hop, rock 	St Paul 	qliviastrings@gmail.com	Qliviastrings.com
62	Eric Struve	Bass, electric/upright w bow	\N	\N	Folk, Jazz, Blues, Americana, Rock, Classical, Bluegrass, Country	Minneapolis	ericstruve@gmail.com	http://www.thepoornobodys.com/ink-no-ink 
63	Zaq Baker	Piano	Keyboards / synths	Voice	Pop, rock, indie, musical theatre, pop-punk	Minneapolis	zaqbakermusic@gmail.com	zaqbaker.com
64	Will Keebler	Drums/percussion	Guitar	Bass guitar	Rock, Indie, Alt, Pop, Grunge, Punk	Minneapolis	willkeeblermusic@gmail.com	Instagram @will.keebler, www.willkeebler.com
65	Will Suit	Bass	Piano	Sax	Funk. Punk. Heavy. Metal. Indie. 	Saint Anthony/Minneapolis 	Willjsuit@hotmail.com	\N
66	Jason Andriano	Trombone	\N	\N	Anything that needs a trombone	Minneapolis	andrianojason8@gmail.com	\N
67	Colby  Hansen	Bass guitar 	Drums	\N	Rock, Pop, Jazz, R&B, Folk, Indie, Electronic	Minneapolis 	Colbyeh@gmail.com	@colby.colby.colby 
68	Robin Hatterschide	Drums	Percussion	\N	Rock, RnB/Soul, Funk, Psych, Blues, Americana, Jazz, some Latin experience	Minneapolis	robinhatterschide@gmail.com	Instagram: @thegettogether.band, @idlflo.music
69	David Jarnstrom	Drums 	\N	\N	Rock, pop, indie, punk, hardcore, post-hardcore, etc.	Minneapolis	davejarnstrom@gmail.com	Instagram: @djstrom (bands: Rad Owl, Dead History, Align, BNLX, Justin Pierre (Motion City Soundtrack), 
70	Jeff  Ray 	Resonator guitar 	Electric guitar 	\N	Rock, blues, folk, indie	St Paul 	jeffraymusic@gmail.com	https://youtube.com/@jeffray5967
71	Travis Clark	Electric bass	\N	\N	Rock, punk, funk, pop	Minneapolis, same neighborhood as the studio	travisclarkmarketing@gmail.com	My band's EP - https://open.spotify.com/album/381EHlCtDB8vZe0zhU1v4k?si=-0RcsmgBTcWDE0kju_kGqg&context=spotify%3Aalbum%3A381EHlCtDB8vZe0zhU1v4k
72	Erik Saxton	Bass Guitar	Saxophone 	Drumset	Rock, punk, jazz, funk, ska, reggae	Saint Paul	Erik.saxton@yahoo.com	https://instagram.com/runaway_rik?utm_source=qr&igshid=MzNlNGNkZWQ4Mg%3D%3D
73	Michael Shannon	Guitar	\N	\N	Alternative, Indie, folk	St. Paul	michaelshannonj@gmail.com	Projects include Ginny & The Fizz, Annex Panda, and Salmon Hands
74	Maddie Thies 	Electric Bass	Double Bass	Vocal 	I have performed and recorded across most genres -- including but not limited to alt rock, chamber pop, indie, RnB, singer songwriter, classical, experimental/genre fluid project,  etc.  	Minneapolis, MN 	maddiejthies@gmail.com 	https://linktr.ee/bassheavii
75	Robert Martin	Drums	Bass	Guitar	indie rock, psychedelic rock, power pop, post rock	Minneapolis	letttersmusic@gmail.com	lettters.bandcamp.com
76	Jon Beighley 	Guitar	\N	\N	Rock/Blues/Americana	Saint Louis park 	Beighley14@gmail.com	\N
77	Tim Adams	Drums	Vocals	Piano	Rock, pop, country, blues 	Minneapolis 	Adams.timmay@gmail.com	https://open.spotify.com/artist/52LLrCjaQJ8Wt3bmTECjZn?si=3u6TO0vsTrOKZkOHBDTGuw
78	Bob Delage	Electric Bass	Double Bass	\N	Rock, Funk, Jam Band, Country, Jazz	Minneapolis	brandondelage99@gmail.com	https://instagram.com/bigbassbob5?igshid=MjEwN2IyYWYwYw==
79	Bryan Highhill	Trumpet	Keys	\N	pop, indie, ska, reggae, punk, funk, soul, afrobeat	Minneapolis	bryanhighhill@gmail.com	www.lumpyrecordings.com
80	Josh McKay	Drum Set	Drum Machines/Sequencers	\N	Rock/Pop/Indie	Burnsville, MN	Joshua.McKay@gmail.com	IG: @joshuabmckay 
81	Bryce Foster	Vocals/Rapping	\N	\N	Hip-Hop/Rap	Minneapolis	bdaman.the.rapper@gmail.com	http://www.youtube.com/BDaManTheRapper
82	Peter Carlen	Guitar	\N	\N	Rock, blues, indie, folk	Minneapolis	pcarlen4@gmail.com	Instagram: p_carlen
83	Sean Hoffman	Drums	Bass	\N	Rock, Pop, Metal, Funk, Punk, Folk, Country	St Paul 	Seanrhoffman@yahoo.com	\N
84	Nathan Loesch	Trumpet 	Bass Guitar	Piano/Vocals	Can play in most if not all styles 	Minneapolis	Nathanloeschmusic@gmail.com	\N
85	Josh McGuire	Electric bass 	\N	\N	Soul/R&B/Blues/Hip hop/Blues/lofi/Rock/Punk	Lino Lakes	Joshbass4@hotmail.com	Josh.Mackk84
86	Doc (AKA Pat Dougherty)	Guitar/vocals	Piano/synth/bass/uke/banjo/lap steel/mandolin/dobro	drums/percussion 	All Genres: can fake just about everything 	St. Paul	knotheyself@gmail.com	https://linktr.ee/patdougherty
87	Nic Hentges	Mandolin	Tenor Banjo	Acoustic guitar	americana	Minneapolis	nihentges@gmail.com	www.nomansstringband.com
88	Eric Carranza	Guitar 	Bass	Keys/synths	Rock, indie, r&b, experimental 	Saint Paul	Lowertownsounds@gmail.com	Ericjuliocarranza.com
89	Serdar G	Guitar	\N	\N	 Reggae, Jazz, Blues, Rock, Soca, Calypso, Turkish, Hip-hop	Minneapolis 	Gravitygrooves@yahoo.com	Dredidread.com
90	Eli Prottengeier	Drums	\N	\N	Blues, Alt Rock, Country, Alternative, any amalgamation of those genres	Minneapolis	elipro612@gmail.com	Companytown.bandcamp.com shambletownrebels.bandcamp.com Toy Planes
91	Charlie  Milkey	Bass guitar	\N	\N	Pop, rock, country, hard rock, experimental	Fridley, mn	Pilotcp@gmail.com	\N
92	Nii Mensah	Electric Bass	Auxilliary Percussion	Gyil (Ghanaian Xylophone)	R&B, Gospel, Neo Soul, Funk, Rock, World Music	Minneapolis	NiiBox@gmail.com	NiiBox.com, IG: @NiiBox, YT: @NiiBox, FB: @NiiBox
93	Felipe Herrera	Bass	\N	\N	Rock, blues, jazz	Minneapolis	felipeherrera.aguirre@gmail.com	https://open.spotify.com/artist/3f3USshULE8UzrVZwrJeH0?si=7yy1WhlPRWyBU5o0TqSReg
94	Christian Wheeler	Guitar	Bass	Drums	Rock, Pop, Theater, R&B, Country, Jazz etc	St Paul	Cwheelermusic@gmail.com	\N
95	Charlie Bruber	Electric/Upright Bass	Guitar	Keyboards/Synths	Jazz, Rock, Funk, Soul, Blues	Minneapolis	Charlie.bruber@gmail.com	https://spotify.link/WLYfwHzeICb
96	Ted Olsen	Upright Bass/Acoustic Bass	Bass Guitar/Electric Bass	\N	Singer/Songwriter, R&B, Jazz, Rock, Blues, Indie	St. Paul	tedolsenmusic@gmail.com	IG: @tedolsenmusic tedolsenmusic.com
97	Shane Cox	Trumpet	Trombone	Sousaphone	Commercial/Funk/Jazz/Balkan	Minneapolis	shane.cox@funkyspuds.com	https://www.youtube.com/channel/UCcCsR9fWLERUr5m8KL3xC8g
98	Michael Gunvalson	Drums	Guitar	Piano	Indie-Rock, Americana, Country, Singer-Songwriter, Punk, Emo, Jazz, Rock, Hip Hop, Pop	Minneapolis, MN	mgunvalson@gmail.com	https://music.apple.com/us/playlist/m-gunvalson-albums-projects-collabs/pl.u-NpXmYdmCplR6BM
99	Patrick Liedl	Electric bass	Flute	\N	Jazz and blues	Barron Wi	Pustoes@gmail.com	\N
100	Tim Sunday	Bass	Rhythm Guitar (acoustic or electric)	Aux percussion	Country, Americanna, Singer Songwriter, Church	St Paul	Email@TimSunde.com	Tim Sunday.com
101	Andy Mcclure	Bass	\N	\N	Americana, pop, rock	Minneapolis	andy@andymcclure.com	www.AndyMcClure.com
102	Dylan Dykstra	Bass Guitar	Bass Guitar (Fretless 6 string)	Sound Effects & Samples	Country, Metal, Prog, Rock, Pop	Edina	Dyldyk@gmail.com	https://spotify.link/lrIiLyiD3Db
103	Jonathon Roll	Drums	Guitar	Bass	All forms of rock (punk, classic, r&r), metal, hip-hop, electronic	Granite Falls, MN (I track at home though)	birdbrainbeats50@gmail.com	https://birdbrainbeats50.wixsite.com/1234
104	Isaac Mayhew	Trumpet	Composer/Arranger	\N	Classical, Rock, Ska, Chamber Pop, etc.	Saint Paul	isaac.j.mayhew@gmail.com	isaacmayhewcomposition.com; https://isaacmayhewcomposition.bandcamp.com/
105	Jonathon Roll	Drums	Guitar	Bass	Rock, Classic Rock, Punk, Progressive Rock, Metal	\N	\N	https://birdbrainbeats50.wixsite.com/birdbrainbeats
106	Andrew Tomten	Saxophones	Flute	Keyboards	Jazz, Funk, Soul, Rock	Minneapolis	atomten@gmail.com	\N
107	Danny Walsh	Piano/keyboard	\N	\N	Indie Folk/Alternative	Minneapolis	dannywalshslp@gmail.com	\N
108	Matt Sluder	Drums	\N	\N	Rock, blues, jazz, funk	Minneapolis	masluder@live.com	\N
109	Dan Culhane	Electric bass	Upright Bass	Bass vi	Rock, RnB, Soul, Funk, Country, Classical	Minneapolis 	dculhane307@gmail.com	https://open.spotify.com/artist/4Sb8ZFO9wG9YK1xZx1AqaZ?si=wR-UHGQUSWq_yoDyhTVQkQ
110	Kevin Martinez	Vocals	\N	\N	Rap	Minneapolis 	Kevinmartinez0531@gmail.com	\N
111	Evan Remmel	Vocals	\N	\N	Hard rock, power metal, soft rock, new wave, baroque-pop, clean vocals	Minneapolis	Ehremmel@icloud.com	https://music.apple.com/us/album/kill-me-now/1423153976?i=1423154593
112	Taylor Benson	Piano	Voice	\N	Progressive Rock, R&B, Funk	Downtown Minneapolis	taylordbenson108@gmail.com	https://youtu.be/0UuxfqWOohI
113	John Yates	Electric Guitar 	\N	\N	Blues, Rock, POP	RoseMount Minnesota 	jyates96@yahoo.com	https://youtu.be/7x6GeP7M6QE and https://youtu.be/WD976j2Xb2M
114	Erik Brandt	Accordion	Piano	Organ	Americana, folk, country, jazz, experimental	Saint Paul	office@erikbrandt.com	https://www.youtube.com/user/UHQ1995
115	Michael Cain	Guitar	Voice	Percussion (Mallet)	Country Blues Rock	Saint Paul, MN	michael.cain@2100enterprises.com	cainandco.band
116	Jensen Koch	Drums	Harsh Vocals (Screams)	\N	Death metal, Black metal, Deathcore, Hardcore, Progressive Metal, Funk, R&B, Rock, Jazz, World	Minneapolis	jtkoch12@gmail.com	https://open.spotify.com/track/4oqCdUgwrhyUisFIHj9IY0?si=15049a7922d54627   https://open.spotify.com/track/7frj62I4R7pmbkDjOen5eA?si=d35adb3e06604514
117	Kayden Emantsal	Vocals - extreme/weird	Vocals - clean/melodic	\N	Metal, Rock, Weird	Minneapolis	kayden.thira@gmail.com	https://xaeto.bandcamp.com/track/undone
118	Hilary  James	Cello	\N	\N	Literally anything you want me to play. I play in chamber orchestras and have also performed with Ms. Lauren Hill. I can read music or write my own parts/improvise. 	Minneapolis 	hillajames@gmail.com	Bathtub cig (Instagram) can also send a long list of records I’ve played cello locally and internationally. 
119	Mark Ilaug	Guitar	Sitar	\N	Guitar(40 yrs rock, fusion, pop) Sitar (25yrs Indian Classical)	Minneapolis / St Paul MN	milaug@icloud.com	Sitar/Guitar- https://youtu.be/5hV2KsDvyp8?si=DF9m2vYNWYlkZByk
\.


--
-- Data for Name: show_bands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.show_bands (show_id, band_id) FROM stdin;
\.


--
-- Data for Name: shows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shows (event_link, flyer_image, id, start, venue_id, bands, created_at, updated_at, is_deleted) FROM stdin;
https://first-avenue.com/event/2024-12-billy-woods-and-kenny-segal/	https://first-avenue.com/wp-content/uploads/2024/08/BillyWoodsKennySegal-120224-1080v1.jpg	4	2024-12-02 20:00:00	7	billy woods, Kenny Segal, ShrapKnel	2024-12-22 21:11:00.174671	2024-12-22 21:11:00.174671	f
https://first-avenue.com/event/2024-12-sam-greenfield/	https://first-avenue.com/wp-content/uploads/2024/08/SamGreenfield-120324-1080.jpg	6	2024-12-03 20:00:00	46	Sam Greenfield, Wintry Elementary	2024-12-22 21:11:04.620624	2024-12-22 21:11:04.620624	f
https://first-avenue.com/event/2024-12-belles/	https://first-avenue.com/wp-content/uploads/2024/08/Belles-120424-1080v2.jpg	7	2024-12-04 19:30:00	1	Belles, Trevor Martin, Monique Smaz	2024-12-22 21:11:05.082062	2024-12-22 21:11:05.082062	f
https://first-avenue.com/event/2024-12-greet-death/	https://first-avenue.com/wp-content/uploads/2024/10/GreetDeath-120424-1080x1558-1.jpg	8	2024-12-04 20:00:00	46	Greet Death, Prize Horse	2024-12-22 21:11:06.60584	2024-12-22 21:11:06.60584	f
https://first-avenue.com/event/2024-12-blood-incantation/	https://first-avenue.com/wp-content/uploads/2024/08/BloodIncantaion-120424-1080.jpg	9	2024-12-04 20:00:00	7	Blood Incantation, Midwife	2024-12-22 21:11:08.224213	2024-12-22 21:11:08.224213	f
https://first-avenue.com/event/2024-12-bands-for-the-banned/	https://first-avenue.com/wp-content/uploads/2024/10/BandsfortheBanned-120524-1080.jpg	10	2024-12-05 19:30:00	1	Dad Bod, WBS (Thomas Abban & L.A. Buckner), Chutes, Yonder	2024-12-22 21:11:09.773347	2024-12-22 21:11:09.773347	f
https://first-avenue.com/event/2024-12-little-fevers/	https://first-avenue.com/wp-content/uploads/2024/10/LittleFevers-120524-1080.jpg	11	2024-12-05 19:30:00	46	Little Fevers, Pleasure Horse, Betty Won't, Echo Parlor	2024-12-22 21:11:11.474066	2024-12-22 21:11:11.474066	f
https://first-avenue.com/event/2024-12-drew-baldridge/	https://first-avenue.com/wp-content/uploads/2024/08/DrewBaldridge-120524-1080v1.jpg	12	2024-12-05 19:30:00	7	Drew Baldridge, Tori Martin, Dylan Wolfe	2024-12-22 21:11:12.899186	2024-12-22 21:11:12.899186	f
https://first-avenue.com/event/2024-12-mason-ramsey/	https://first-avenue.com/wp-content/uploads/2024/06/MasonRamsey-120624-1080.jpg	13	2024-12-06 19:30:00	1	Mason Ramsey, Halle Kearns	2024-12-22 21:11:13.336299	2024-12-22 21:11:13.336299	f
https://first-avenue.com/event/2024-12-church-of-cash/	https://first-avenue.com/wp-content/uploads/2024/09/ChurchofCash-120624-1080.jpg	14	2024-12-06 20:00:00	46	Church of Cash, El Drifte	2024-12-22 21:11:14.627713	2024-12-22 21:11:14.627713	f
https://first-avenue.com/event/2024-12-viva-knievel/	https://first-avenue.com/wp-content/uploads/2024/10/VivaKnievel-120624-1080x1669-1.jpg	15	2024-12-06 20:30:00	8	Viva Knievel	2024-12-22 21:11:15.115304	2024-12-22 21:11:15.115304	f
https://first-avenue.com/event/2024-12-tophouse/	https://first-avenue.com/wp-content/uploads/2024/04/TopHouse-120624-1080v1.jpg	16	2024-12-06 20:30:00	7	Tophouse, Griffin William Sherry	2024-12-22 21:11:15.580566	2024-12-22 21:11:15.580566	f
https://first-avenue.com/event/2024-12-dillinger-four-and-extreme-noise-records/	https://first-avenue.com/wp-content/uploads/2024/09/DillingerFour-120724-1080x1669-1.jpg	17	2024-12-07 18:00:00	8	Dillinger Four, Home Front, Canal Irreal, Condominium, BUIO OMEGA	2024-12-22 21:11:17.191329	2024-12-22 21:11:17.191329	f
https://first-avenue.com/event/2024-12-nutcracker-sat/	https://first-avenue.com/wp-content/uploads/2024/08/Nutcracker-Ballet-Dec2024-1080.jpg	18	2024-12-07 19:30:00	50	Metropolitan Ballet presentsNutcracker	2024-12-22 21:11:18.64465	2024-12-22 21:11:18.64465	f
https://first-avenue.com/event/2024-12-gavn/	https://first-avenue.com/wp-content/uploads/2024/06/Gavn-120724-1080v1.jpg	19	2024-12-07 20:00:00	1	gavn!, Kate Yeager, Adam Yokum, Brompton	2024-12-22 21:11:19.986718	2024-12-22 21:11:19.986718	f
https://first-avenue.com/event/2024-12-joe-russos-almost-dead/	https://first-avenue.com/wp-content/uploads/2024/08/JoeRussosAlmostDead-120724-1080.jpg	20	2024-12-07 20:00:00	24	Joe Russo's Almost Dead	2024-12-22 21:11:20.617467	2024-12-22 21:11:20.617467	f
https://first-avenue.com/event/2024-12-bloodline-vinny-franco-and-the-love-channel-tarias-and-the-sound-and-the-dalmatian-club/	https://first-avenue.com/wp-content/uploads/2024/10/Bloodline-120724-1080x1669-1.jpg	21	2024-12-07 20:00:00	46	Bloodline, Vinny Franco and the Love Channel, Tarias and the Sound, The Dalmatian Club	2024-12-22 21:11:22.025427	2024-12-22 21:11:22.025427	f
https://first-avenue.com/event/2024-12-wolves-of-glendale/	https://first-avenue.com/wp-content/uploads/2024/06/WolvesofGlendale-120724-1080x1669v1.jpg	22	2024-12-07 20:30:00	7	Wolves of Glendale, Loreweavers	2024-12-22 21:11:23.603827	2024-12-22 21:11:23.603827	f
https://first-avenue.com/event/2024-12-nutcracker-sun/	https://first-avenue.com/wp-content/uploads/2024/08/Nutcracker-Ballet-Dec2024-1080.jpg	23	2024-12-08 14:00:00	50	Metropolitan Ballet presentsNutcracker	2024-12-22 21:11:24.18892	2024-12-22 21:11:24.18892	f
https://first-avenue.com/event/2024-12-john-lennon-tribute/	https://first-avenue.com/wp-content/uploads/2024/09/JohnLennonTribute-120824-1080-1.jpg	24	2024-12-08 18:00:00	8	Curtiss A with a little help from his friends	2024-12-22 21:11:25.204139	2024-12-22 21:11:25.204139	f
https://first-avenue.com/event/2024-12-girli/	https://first-avenue.com/wp-content/uploads/2024/09/Girli-120824-1080.jpg	25	2024-12-08 20:00:00	46	girli, Tricksy	2024-12-22 21:11:26.603261	2024-12-22 21:11:26.603261	f
https://first-avenue.com/event/2024-12-johnny-delaware/	https://first-avenue.com/wp-content/uploads/2024/08/JohnnyDelaware-120824-1080v1.jpg	26	2024-12-08 20:00:00	1	Johnny Delaware, C.M.M.	2024-12-22 21:11:28.031798	2024-12-22 21:11:28.031798	f
https://first-avenue.com/event/2024-12-girl-in-red/	https://first-avenue.com/wp-content/uploads/2024/09/GirlInRed-121024-1080v1.jpg	27	2024-12-10 19:30:00	24	girl in red, Sunday (1994)	2024-12-22 21:11:29.830547	2024-12-22 21:11:29.830547	f
https://first-avenue.com/event/2024-12-fend-admiral-fox-natl-park-srvc-and-joe-bartel/	https://first-avenue.com/wp-content/uploads/2024/10/Fend-121124-1080x1669-1.jpg	28	2024-12-11 19:30:00	1	Fend, Admiral Fox, NATL PARK SRVC, Joe Bartel	2024-12-22 21:11:30.293117	2024-12-22 21:11:30.293117	f
https://first-avenue.com/event/2024-12-luminare-christmas/	https://first-avenue.com/wp-content/uploads/2024/09/LuminareChristmas-121124-1080.jpg	29	2024-12-11 20:00:00	50	Luminare Christmas	2024-12-22 21:11:30.753357	2024-12-22 21:11:30.753357	f
https://first-avenue.com/event/2024-12-arin-ray/	https://first-avenue.com/wp-content/uploads/2024/09/ArinRay-121224-1080.jpg	30	2024-12-12 19:30:00	7	Arin Ray	2024-12-22 21:11:31.3367	2024-12-22 21:11:31.3367	f
https://first-avenue.com/event/2024-12-the-silent-treatment-the-heavy-sixers-muun-bato-and-the-99ers/	https://first-avenue.com/wp-content/uploads/2024/11/ST_H6RS_MB_99rs-121224-1080.jpg	31	2024-12-12 19:30:00	46	The Silent Treatment, The Heavy Sixers, The 99ers	2024-12-22 21:11:32.722182	2024-12-22 21:11:32.722182	f
https://first-avenue.com/event/2024-12-daphne-jane/	https://first-avenue.com/wp-content/uploads/2024/11/DaphneJane-121224-1080x1669-1.jpg	32	2024-12-12 19:30:00	1	Daphne Jane, Ella Luna, Ava Levy, Kiernan	2024-12-22 21:11:33.479822	2024-12-22 21:11:33.479822	f
https://first-avenue.com/event/2025-02-wunderhorse/	https://first-avenue.com/wp-content/uploads/2024/09/Wunderhorse-020225-1080v1.jpg	247	2025-02-02 20:00:00	46	Wunderhorse, Deux Visages	2024-12-22 21:14:43.125908	2024-12-22 21:14:43.125908	f
https://first-avenue.com/event/2024-12-choir-choir-choir/	https://first-avenue.com/wp-content/uploads/2024/09/ChoirChoirChoir-120124-1080.jpg	2	2024-12-01 20:00:00	7	Choir! Choir! Choir!	2024-12-22 21:10:57.601658	2024-12-22 21:10:57.601658	f
https://first-avenue.com/event/2024-12-the-thing/	https://first-avenue.com/wp-content/uploads/2024/10/TheThing-120324-1080.jpg	5	2024-12-03 20:00:00	1	The Thing, Lighter Co.	2024-12-22 21:11:02.021662	2024-12-22 21:11:02.021662	f
https://palmers-bar.com/calendar/2024/10/1/palmers-songwriters-showcase-hosted-by-max-markin-1st-tuesdays-monthly-free-gstn9-7pdc2	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/8bf69e54-bc46-4152-ac7c-ce5734da4a75/Palmer%27s+Songwriters+Showcase+banner.png	4890	2025-01-07 19:00:00	37	palmer's songwriters showcase hosted by max markin '1st tuesdays monthly	2025-01-04 18:57:29.00763	2025-01-04 18:57:29.00763	f
https://first-avenue.com/event/2024-12-wilco-fri/	https://first-avenue.com/wp-content/uploads/2024/09/Wilco-Dec2024-1080x1669-1.jpg	35	2024-12-13 20:00:00	24	Wilco	2024-12-22 21:11:36.419497	2024-12-22 21:11:36.419497	f
https://first-avenue.com/event/2024-12-emo-nite/	https://first-avenue.com/wp-content/uploads/2024/10/EmoNite-121324-1080v1.jpg	38	2024-12-13 21:00:00	8	Emo Nite, Derek Sanders (of Mayday Parade)	2024-12-22 21:11:38.653325	2024-12-22 21:11:38.653325	f
https://first-avenue.com/event/2024-12-illiterate-light/	https://first-avenue.com/wp-content/uploads/2024/08/IlliterateLight-121324-1080.jpg	37	2024-12-13 20:00:00	1	Illiterate Light, Palmyra	2024-12-22 21:11:38.152598	2024-12-22 21:11:38.152598	f
https://first-avenue.com/event/2024-12-santa-rave/	https://first-avenue.com/wp-content/uploads/2024/09/SantaRave_121324-1080.jpg	39	2024-12-13 21:00:00	7	Santa Rave ⏤ The Ultimate Holiday Themed Rave	2024-12-22 21:11:39.069752	2024-12-22 21:11:39.069752	f
https://first-avenue.com/event/2024-12-heart-to-gold/	https://first-avenue.com/wp-content/uploads/2024/10/HeartToGold-121424-1080.jpg	40	2024-12-14 18:45:00	7	Heart to Gold, Gully Boys, Gramma, Scrunchies	2024-12-22 21:11:39.703094	2024-12-22 21:11:39.703094	f
https://first-avenue.com/event/2024-12-a-prairie-home-companion-christmas-sat/	https://first-avenue.com/wp-content/uploads/2024/07/APrairieHomeCompanion-dec2024-1080.jpg	41	2024-12-14 19:30:00	50	A Prairie Home Companion	2024-12-22 21:11:40.895174	2024-12-22 21:11:40.895174	f
https://first-avenue.com/event/2024-12-wilco-sat/	https://first-avenue.com/wp-content/uploads/2024/09/Wilco-Dec2024-1080x1669-1.jpg	42	2024-12-14 20:00:00	24	Wilco	2024-12-22 21:11:42.102613	2024-12-22 21:11:42.102613	f
https://first-avenue.com/event/2024-12-martin-zellar/	https://first-avenue.com/wp-content/uploads/2024/09/MartinZellar-121424-1080.jpg	43	2024-12-14 20:00:00	46	Martin Zellar, LAAMAR	2024-12-22 21:11:43.453742	2024-12-22 21:11:43.453742	f
https://first-avenue.com/event/2024-12-basic/	https://first-avenue.com/wp-content/uploads/2024/09/Basic-121424-1080v1.jpg	44	2024-12-14 20:00:00	1	BASIC: Chris Forsyth, Douglas McCombs, Mikel Patrick Avery, Yr Knives, American Cream Band	2024-12-22 21:11:43.879454	2024-12-22 21:11:43.879454	f
https://first-avenue.com/event/2024-12-the-last-revel/	https://first-avenue.com/wp-content/uploads/2024/07/TheLastRevel-121424-1080.jpg	45	2024-12-14 20:00:00	8	The Last Revel, Two Runner	2024-12-22 21:11:44.39127	2024-12-22 21:11:44.39127	f
https://first-avenue.com/event/2024-12-the-rock-and-roll-playhouse/	https://first-avenue.com/wp-content/uploads/2024/09/RRPH-TaylorSwift-121524-1080.jpg	46	2024-12-15 11:30:00	8	The Rock and Roll Playhouse, Bri & The Antiheroes	2024-12-22 21:11:45.585088	2024-12-22 21:11:45.585088	f
https://first-avenue.com/event/2025-12-a-skylit-drive/	https://first-avenue.com/wp-content/uploads/2024/09/ASkylitDrive-121524-1080.jpg	48	2024-12-15 20:00:00	1	A Skylit Drive, Odds of an Afterthought	2024-12-22 21:11:47.057931	2024-12-22 21:11:47.057931	f
https://first-avenue.com/event/2024-12-brother-ali/	https://first-avenue.com/wp-content/uploads/2024/09/BrotherAli-121524-1080x1669v0.jpg	49	2024-12-15 20:00:00	8	Brother Ali, Ant, Dee-1, MaLLy	2024-12-22 21:11:48.456079	2024-12-22 21:11:48.456079	f
https://first-avenue.com/event/2024-12-wilco-sun/	https://first-avenue.com/wp-content/uploads/2024/09/Wilco-Dec2024-1080x1669-1.jpg	50	2024-12-15 20:00:00	24	Wilco	2024-12-22 21:11:48.897873	2024-12-22 21:11:48.897873	f
https://first-avenue.com/event/2024-12-josh-ritter/	https://first-avenue.com/wp-content/uploads/2024/09/JoshRitter-121624-1080x1671-1.jpg	51	2024-12-16 19:30:00	50	Josh Ritter	2024-12-22 21:11:49.500689	2024-12-22 21:11:49.500689	f
https://first-avenue.com/event/2024-12-moonlander/	https://first-avenue.com/wp-content/uploads/2024/10/Moonlander-barelytrev-1080-121724v2.jpg	52	2024-12-17 19:30:00	1	MoonLander, Barely Trev, Broderick Jones, Jake Luke	2024-12-22 21:11:51.083227	2024-12-22 21:11:51.083227	f
https://first-avenue.com/event/2024-12-private-event-121824/	https://first-avenue.com/wp-content/uploads/2020/01/1stave_privateevent-sq_0.jpg	53	2024-12-18 17:30:00	46	PRIVATE EVENT	2024-12-22 21:11:52.620288	2024-12-22 21:11:52.620288	f
https://first-avenue.com/event/2024-12-anni-xo/	https://first-avenue.com/wp-content/uploads/2024/09/AnniXO-121824-1080.jpg	54	2024-12-18 19:30:00	1	anni xo, Anna Devine, The Penny Peaches, Dilly Dally Alley	2024-12-22 21:11:53.985872	2024-12-22 21:11:53.985872	f
https://first-avenue.com/event/2024-12-boney-james/	https://first-avenue.com/wp-content/uploads/2024/10/BoneyJames-121824-1080.jpg	55	2024-12-18 20:00:00	50	Boney James	2024-12-22 21:11:54.808777	2024-12-22 21:11:54.808777	f
https://first-avenue.com/event/2024-12-a-charlie-brown-christmas/	https://first-avenue.com/wp-content/uploads/2024/11/CharlieBrownChristmas-121924-1080.jpg	56	2024-12-19 19:00:00	46	Blue Ox Trio	2024-12-22 21:11:56.528492	2024-12-22 21:11:56.528492	f
https://first-avenue.com/event/2024-12-upright-forms-curve-in-lieu-and-unstable-shapes/	https://first-avenue.com/wp-content/uploads/2024/09/UprightForms-121924-1080.jpg	57	2024-12-19 19:30:00	1	Upright Forms, Curve, In Lieu, Unstable Shapes	2024-12-22 21:11:57.719478	2024-12-22 21:11:57.719478	f
https://first-avenue.com/event/2024-12-caitlyn-smith/	https://first-avenue.com/wp-content/uploads/2024/09/CaitlynSmith-121924-1080v1.jpg	58	2024-12-19 19:30:00	50	Caitlyn Smith, Ben Goldsmith	2024-12-22 21:11:58.139924	2024-12-22 21:11:58.139924	f
https://first-avenue.com/event/2024-12-the-jayhawks-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TheJayhawks-Dec2024-1080v2.jpg	59	2024-12-20 19:30:00	50	The Jayhawks, Freedy Johnston	2024-12-22 21:11:59.313901	2024-12-22 21:11:59.313901	f
https://first-avenue.com/event/2024-12-rifflord/	https://first-avenue.com/wp-content/uploads/2024/10/Rifflord-122024-1080v1.jpg	60	2024-12-20 20:00:00	1	RIFFLORD, MURF, DUG	2024-12-22 21:12:00.637718	2024-12-22 21:12:00.637718	f
https://first-avenue.com/event/2024-12-trailer-trash-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TrailerTrash-Dec2024-1080x1669-1.jpg	61	2024-12-20 20:00:00	46	Trailer Trash	2024-12-22 21:12:01.061837	2024-12-22 21:12:01.061837	f
https://first-avenue.com/event/2024-12-chapel-hart/	https://first-avenue.com/wp-content/uploads/2024/07/ChapelHart-122024-1080v1.jpg	62	2024-12-20 20:00:00	7	Chapel Hart, Molly Brandt	2024-12-22 21:12:02.257706	2024-12-22 21:12:02.257706	f
https://first-avenue.com/event/2024-12-son-little/	https://first-avenue.com/wp-content/uploads/2024/07/SonLittle-122024-1080-1.jpg	63	2024-12-20 20:00:00	2	Son Little, Kyah Bratz	2024-12-22 21:12:02.839231	2024-12-22 21:12:02.839231	f
https://first-avenue.com/event/2024-12-hot-freaks/	https://first-avenue.com/wp-content/uploads/2024/10/HotFreaks-122124-1080x1669-1.jpg	64	2024-12-21 19:00:00	7	Hot Freaks, Sleeping Jesus, Products Band	2024-12-22 21:12:03.585882	2024-12-22 21:12:03.585882	f
https://first-avenue.com/event/2024-12-extreme-noise-30th-anniversary-entry/	https://first-avenue.com/wp-content/uploads/2024/10/ExtremeNoise-122124-1080v1.jpg	65	2024-12-21 19:30:00	1	P.L.F., Archagathus, Bodies Lay Broken, Black Market Fetus, Deterioration	2024-12-22 21:12:05.054392	2024-12-22 21:12:05.054392	f
https://first-avenue.com/event/2024-12-tribute-to-the-replacements/	https://first-avenue.com/wp-content/uploads/2024/09/ReplacementsTribute-121324-1080x1669v2.jpg	34	2024-12-13 19:30:00	46	A Tribute to The Replacements, The Melismatics, Emma Jeanne, JØUR, Mad Ripple Trib-Hoot for Slim	2024-12-22 21:11:35.161046	2024-12-22 21:11:35.161046	f
https://first-avenue.com/event/2024-12-trailer-trash-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TrailerTrash-Dec2024-1080x1669-1.jpg	69	2024-12-21 20:00:00	46	Trailer Trash	2024-12-22 21:12:09.385221	2024-12-22 21:12:09.385221	f
https://first-avenue.com/event/2024-12-nick-swardson/	https://first-avenue.com/wp-content/uploads/2024/12/NickSwardson-122224-1080.jpg	70	2024-12-22 19:30:00	8	Nick Swardson	2024-12-22 21:12:10.407396	2024-12-22 21:12:10.407396	f
https://first-avenue.com/event/2024-12-trailer-trash-sun/	https://first-avenue.com/wp-content/uploads/2024/10/TrailerTrash-Dec2024-1080x1669-1.jpg	71	2024-12-22 20:00:00	46	Trailer Trash	2024-12-22 21:12:10.812633	2024-12-22 21:12:10.812633	f
https://first-avenue.com/event/2024-12-all-tomorrows-petty-fri/	https://first-avenue.com/wp-content/uploads/2024/11/AllTomorrowsPetty-Dec2024-1080v1.jpg	73	2024-12-27 21:00:00	46	All Tomorrow's Petty, Turn Turn Turn	2024-12-22 21:12:13.241714	2024-12-22 21:12:13.241714	f
https://first-avenue.com/event/2024-12-jaki-blue/	https://first-avenue.com/wp-content/uploads/2024/11/JakiBlue-127224-1080.jpg	74	2024-12-27 21:00:00	1	Jaki Blue, KAYCYY, Sophia Eris	2024-12-22 21:12:15.272318	2024-12-22 21:12:15.272318	f
https://first-avenue.com/event/2024-12-american-girl-doll-rave/	https://first-avenue.com/wp-content/uploads/2024/11/AGDRave-122724-1080.jpg	75	2024-12-27 21:00:00	8	Flip Phone, Ken Doll, Frozaen Pissás, Onya Deek, Queenie von Curves, Priscilla Es Yuicy, Domita Sanchez	2024-12-22 21:12:17.05603	2024-12-22 21:12:17.05603	f
https://first-avenue.com/event/2024-12-soul-asylum/	https://first-avenue.com/wp-content/uploads/2024/10/SoulAsylum-122824-1080v2.jpg	76	2024-12-28 19:30:00	8	Soul Asylum, Tommy Stinson	2024-12-22 21:12:19.377537	2024-12-22 21:12:19.377537	f
https://first-avenue.com/event/2024-12-shrimpnose/	https://first-avenue.com/wp-content/uploads/2024/10/Shrimpnose-122824-1080v1.jpg	77	2024-12-28 20:00:00	1	Shrimpnose, Wicker's Portal, Daedelus, student 1, TaliaKnight	2024-12-22 21:12:20.188244	2024-12-22 21:12:20.188244	f
https://first-avenue.com/event/2024-12-all-tomorrows-petty-sat/	https://first-avenue.com/wp-content/uploads/2024/11/AllTomorrowsPetty-Dec2024-1080v1.jpg	78	2024-12-28 21:00:00	46	All Tomorrow's Petty, A Little Too Short To Be Stormtroopers	2024-12-22 21:12:20.632533	2024-12-22 21:12:20.632533	f
https://first-avenue.com/event/2024-12-qmoe/	https://first-avenue.com/wp-content/uploads/2024/11/Qmoe-122924-1080x1350v2.jpg	79	2024-12-29 19:30:00	1	Qmoe, bdifferent, Mack OC, Nazo, Juice James	2024-12-22 21:12:21.058568	2024-12-22 21:12:21.058568	f
https://first-avenue.com/event/2024-12-devotchka/	https://first-avenue.com/wp-content/uploads/2024/09/Devotchka-122924-1080.jpg	80	2024-12-29 20:00:00	8	DeVotchKa, Superior Siren	2024-12-22 21:12:22.265955	2024-12-22 21:12:22.265955	f
https://first-avenue.com/event/2024-12-you-oughta-know/	https://first-avenue.com/wp-content/uploads/2024/11/YouOughtaKnow-123124-1080.jpg	81	2024-12-31 21:00:00	1	You Oughta Know	2024-12-22 21:12:24.582974	2024-12-22 21:12:24.582974	f
https://first-avenue.com/event/2024-12-transmission-nye/	https://first-avenue.com/wp-content/uploads/2024/11/NYE-Transmission-123124-1080x1669-1.jpg	82	2024-12-31 21:00:00	8	Transmission, DJ Jake Rudh	2024-12-22 21:12:25.130987	2024-12-22 21:12:25.130987	f
https://first-avenue.com/event/2024-12-samambo/	https://first-avenue.com/wp-content/uploads/2024/11/Samambo-123124-1080v1.jpg	83	2024-12-31 21:00:00	7	Samambo, DJ NeekaSoDope, DJ McShellen, Kwey, Rejected Saint, Obi Original	2024-12-22 21:12:25.571442	2024-12-22 21:12:25.571442	f
https://first-avenue.com/event/2024-12-mae-simpson/	https://first-avenue.com/wp-content/uploads/2024/11/MaeSimpson-NYE-123124-1080v1.jpg	84	2024-12-31 21:00:00	46	Mae Simpson, Hiahli, Juice Lord, DJ Brian Engel of Hipshaker	2024-12-22 21:12:26.02413	2024-12-22 21:12:26.02413	f
https://first-avenue.com/event/2025-01-landon-conrath-wk1/	https://first-avenue.com/wp-content/uploads/2024/09/LandonConrath-jan2025-1080v1.jpg	169	2025-01-02 20:00:00	1	Landon Conrath, Kiernan, Alex Delzer	2024-12-22 21:13:10.95056	2024-12-22 21:13:10.95056	f
https://first-avenue.com/event/2024-12-the-jayhawks-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TheJayhawks-Dec2024-1080v2.jpg	67	2024-12-21 19:30:00	50	The Jayhawks, Freedy Johnston	2024-12-22 21:12:06.739341	2024-12-22 21:12:06.739341	f
https://first-avenue.com/event/2025-01-hell-yeah-2/	https://first-avenue.com/wp-content/uploads/2024/11/HellYeah2-010325-1080x1669-1.jpg	170	2025-01-03 19:00:00	46	Mary Lucia, DJ Shane Kramer(of Transmission), DJ Johnnie Johnson, Monica LaPlante	2024-12-22 21:13:12.142333	2024-12-22 21:13:12.142333	f
https://first-avenue.com/event/2025-01-the-holy-north/	https://first-avenue.com/wp-content/uploads/2024/11/TheHolyNorth-010325-1080x1669-1.jpg	171	2025-01-03 20:00:00	1	The Holy North, The Twins of Franklin, Clayton Ryan	2024-12-22 21:13:12.735533	2024-12-22 21:13:12.735533	f
https://first-avenue.com/event/2025-01-wrestlepalooza-fri/	https://first-avenue.com/wp-content/uploads/2024/09/Wrestlepalooza-010325-1080x1350-1.jpg	172	2025-01-03 20:00:00	8	F1RST Wrestling, Viva Knievel, Phoenix De La Rosa, Sweetpea	2024-12-22 21:13:14.097913	2024-12-22 21:13:14.097913	f
https://first-avenue.com/event/2025-01-short-n-sabrina/	https://first-avenue.com/wp-content/uploads/2024/12/ShortnSabrina-010325-1000.jpg	173	2025-01-03 21:00:00	7	Short n’ Sabrina: Sabrina Carpenter Party	2024-12-22 21:13:15.546655	2024-12-22 21:13:15.546655	f
https://first-avenue.com/event/2025-01-early-eyes/	https://first-avenue.com/wp-content/uploads/2024/11/EarlyEyes-010425-1080.jpg	176	2025-01-04 20:00:00	7	Early Eyes, Anita Velveeta, Killed By Kiwis, OISTER BOY	2024-12-22 21:13:17.566728	2024-12-22 21:13:17.566728	f
https://first-avenue.com/event/2025-01-wrestlepalooza-sat/	https://first-avenue.com/wp-content/uploads/2024/09/Wrestlepalooza-010425-1080x1350-1.jpg	175	2025-01-04 20:00:00	8	F1RST Wrestling, Gully Boys, Emerald Eve, Sweetpea	2024-12-22 21:13:17.167121	2024-12-22 21:13:17.167121	f
https://first-avenue.com/event/2025-01-sundown47/	https://first-avenue.com/wp-content/uploads/2024/11/SunDown47-010425-1080v1.jpg	174	2025-01-04 20:00:00	1	SunDown47, The Melismatics, Zander	2024-12-22 21:13:16.012848	2024-12-22 21:13:16.012848	f
https://first-avenue.com/event/2025-01-grammas-boyfriend/	https://first-avenue.com/wp-content/uploads/2024/11/GrammasBoyfriend-010425-1080x1669-1.jpg	177	2025-01-04 20:30:00	46	Gramma's Boyfriend, Oyster World, Ghosting Merit	2024-12-22 21:13:18.793188	2024-12-22 21:13:18.793188	f
https://first-avenue.com/event/2025-01-charlie-parr-wk1/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	178	2025-01-05 19:30:00	46	Charlie Parr, Jon Edwards	2024-12-22 21:13:19.206395	2024-12-22 21:13:19.206395	f
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk1/	https://first-avenue.com/wp-content/uploads/2024/10/cactusblossoms-010625-1080.jpg	179	2025-01-06 19:30:00	46	The Cactus Blossoms, Riley Downing	2024-12-22 21:13:19.652069	2024-12-22 21:13:19.652069	f
https://first-avenue.com/event/2025-01-rosie/	https://first-avenue.com/wp-content/uploads/2024/11/rosie-010825-1080.jpg	180	2025-01-08 19:30:00	1	rosie, Jillian Rae, bathtub cig, Bryn Battani	2024-12-22 21:13:20.24038	2024-12-22 21:13:20.24038	f
https://first-avenue.com/event/2025-01-farewell-milwaukee/	https://first-avenue.com/wp-content/uploads/2024/11/FarewellMilwaukee-010925-1080x1669-1.jpg	181	2025-01-09 20:00:00	46	Farewell Milwaukee, A Piano In Every Home, Big Lake	2024-12-22 21:13:21.660646	2024-12-22 21:13:21.660646	f
https://first-avenue.com/event/2025-02-michelle/	https://first-avenue.com/wp-content/uploads/2024/11/Michelle-020225-1080-FL.jpg	248	2025-02-02 20:00:00	7	MICHELLE, Ayoni	2024-12-22 21:14:44.197249	2024-12-22 21:14:44.197249	f
https://thehookmpls.com/event/250117-zen-hipshaker/	https://thehookmpls.com/wp-content/uploads/2025/01/2025-HIPSHAKER-2048x1024.jpg	4817	2025-01-17 20:30:00	33	Hipshaker MPLS	2025-01-04 18:53:45.263988	2025-01-04 18:53:45.263988	f
https://thehookmpls.com/event/the-bong-show-3-0/	https://thehookmpls.com/wp-content/uploads/2024/12/250119-Hook-TheBongShow-2160x1080-Eventbrite-Website-Twitter-2048x1024.jpg	4819	2025-01-19 20:00:00	33	Light ’em Up THE BONG SHOW 3.0	2025-01-04 18:53:45.278433	2025-01-04 18:53:45.278433	f
https://first-avenue.com/event/2025-01-g-love-special-sauce/	https://first-avenue.com/wp-content/uploads/2024/10/GLove-011025-1080v1.jpg	184	2025-01-10 20:00:00	8	G. Love & Special Sauce, Ron Artis II	2024-12-22 21:13:24.523243	2024-12-22 21:13:24.523243	f
https://first-avenue.com/event/2025-01-internet-kids/	https://first-avenue.com/wp-content/uploads/2024/11/InternetKids-011025-1080x1669v1.jpg	185	2025-01-10 21:00:00	7	INTERNET KIDS ⏤ Hyperpop Dance Party, Cocojoey, bejalvin	2024-12-22 21:13:25.948476	2024-12-22 21:13:25.948476	f
https://first-avenue.com/event/2025-01-sean-anonymous/	https://first-avenue.com/wp-content/uploads/2024/11/SeanAnonymous-011025-1080x1669-1.jpg	186	2025-01-10 21:00:00	1	Sean Anonymous, Ceschi, Demon Marcus, student 1, Dimitry Killstorm, Diane	2024-12-22 21:13:27.207774	2024-12-22 21:13:27.207774	f
https://first-avenue.com/event/2025-01-big-head-todd-and-the-monsters/	https://first-avenue.com/wp-content/uploads/2024/09/BigHeadTodd-011125-1080v1.jpg	188	2025-01-11 19:30:00	24	Big Head Todd and the Monsters, Glen Phillips (of Toad the Wet Sprocket)	2024-12-22 21:13:28.100973	2024-12-22 21:13:28.100973	f
https://first-avenue.com/event/2025-01-ber/	https://first-avenue.com/wp-content/uploads/2024/10/Ber-011125-1080x1669v1.jpg	187	2025-01-11 19:30:00	8	BER, Chutes	2024-12-22 21:13:27.629289	2024-12-22 21:13:27.629289	f
https://first-avenue.com/event/2025-01-benny-everett-with-the-best-intentions/	https://first-avenue.com/wp-content/uploads/2024/11/BennyEverett-011125-1080x1669-1.jpg	190	2025-01-11 20:00:00	46	Benny Everett, The Gated Community	2024-12-22 21:13:30.41379	2024-12-22 21:13:30.41379	f
https://first-avenue.com/event/2025-01-dolly-parton-tribute/	https://first-avenue.com/wp-content/uploads/2024/11/DollyTribute-011125-1080x1669-1.jpg	189	2025-01-11 20:00:00	7	Faith Boblett, Molly Brandt, Rachel Calvert (Barbaro), Laura Hugo, Jaedyn James, Sarah Morris, Savannah Smith, Davina Sowers (Davina & The Vagabonds), Leslie Vincent, A Little Too Short To Be Stormtroopers	2024-12-22 21:13:29.263357	2024-12-22 21:13:29.263357	f
https://first-avenue.com/event/2025-01-freak-on-a-leash-fellowship/	https://first-avenue.com/wp-content/uploads/2024/11/FreakonaLeash-011125-1080.jpg	192	2025-01-11 21:00:00	1	Freak On A Leash Fellowship ⏤ Nu Metal Dance Party	2024-12-22 21:13:32.321894	2024-12-22 21:13:32.321894	f
https://first-avenue.com/event/2025-01-mayfly-moon/	https://first-avenue.com/wp-content/uploads/2024/11/MayflyMoon-011225-1080.jpg	193	2025-01-12 19:30:00	1	Mayfly Moon, Motherwind, Pullstring, Lake Drive	2024-12-22 21:13:33.81618	2024-12-22 21:13:33.81618	f
https://first-avenue.com/event/2025-01-charlie-parr-wk2/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	194	2025-01-12 19:30:00	46	Charlie Parr, Samuel Locke Ward	2024-12-22 21:13:35.017661	2024-12-22 21:13:35.017661	f
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk2/	https://first-avenue.com/wp-content/uploads/2024/10/cactusblossoms-011325-1080.jpg	195	2025-01-13 19:30:00	46	The Cactus Blossoms, Luke Callen	2024-12-22 21:13:36.420502	2024-12-22 21:13:36.420502	f
https://first-avenue.com/event/2025-01-been-stellar/	https://first-avenue.com/wp-content/uploads/2024/10/BeenStellar-011525-1080.jpg	196	2025-01-15 20:00:00	1	Been Stellar, Malice K	2024-12-22 21:13:37.535395	2024-12-22 21:13:37.535395	f
https://first-avenue.com/event/2025-01-joy-oladokun/	https://first-avenue.com/wp-content/uploads/2024/09/JoyOladokun-011625-1080.jpg	197	2025-01-16 19:30:00	8	Joy Oladokun	2024-12-22 21:13:38.880785	2024-12-22 21:13:38.880785	f
https://first-avenue.com/event/2025-01-landon-conrath-wk3/	https://first-avenue.com/wp-content/uploads/2024/09/LandonConrath-jan2025-1080v1.jpg	198	2025-01-16 20:00:00	1	Landon Conrath, Charli Adams, Pageant Dress	2024-12-22 21:13:40.214023	2024-12-22 21:13:40.214023	f
https://first-avenue.com/event/2025-01-heavy-showcase/	https://first-avenue.com/wp-content/uploads/2024/12/HeavyShowcase-011625-1080x1669-1.jpg	200	2025-01-16 20:00:00	46	Van Glow Light Show, American Cream Band, din-din, Erik's Iridescent Tent	2024-12-22 21:13:42.43833	2024-12-22 21:13:42.43833	f
https://first-avenue.com/event/2025-01-jukebox-the-ghost-thu/	https://first-avenue.com/wp-content/uploads/2024/10/JukeboxTheGhost-Jan2025-1080x1669-1.jpg	199	2025-01-16 20:00:00	7	Jukebox the Ghost	2024-12-22 21:13:41.353934	2024-12-22 21:13:41.353934	f
https://first-avenue.com/event/2025-01-jukebox-the-ghost-fri/	https://first-avenue.com/wp-content/uploads/2024/10/JukeboxTheGhost-Jan2025-1080x1669-1.jpg	201	2025-01-17 20:00:00	7	Jukebox the Ghost	2024-12-22 21:13:43.692296	2024-12-22 21:13:43.692296	f
https://first-avenue.com/event/2025-01-twin-citizen/	https://first-avenue.com/wp-content/uploads/2024/11/TwinCitizen-011725-1080v1.jpg	203	2025-01-17 20:00:00	1	Twin Citizen, AirLands, Joe Bartel, Larry Wish	2024-12-22 21:13:46.223706	2024-12-22 21:13:46.223706	f
https://first-avenue.com/event/2025-01-40-oz-to-freedom-sublime-tribute/	https://first-avenue.com/wp-content/uploads/2024/11/40ozToFreedom-011725-1080.jpg	202	2025-01-17 20:00:00	46	40 Oz to Freedom (Sublime Tribute)	2024-12-22 21:13:44.780556	2024-12-22 21:13:44.780556	f
https://first-avenue.com/event/2025-01-isoxo-fri/	https://first-avenue.com/wp-content/uploads/2024/10/ISOxo-Jan25-1080.jpg	204	2025-01-17 20:30:00	8	ISOxo	2024-12-22 21:13:47.499472	2024-12-22 21:13:47.499472	f
https://first-avenue.com/event/2025-01-vvolf-mask-and-caustic-abyss/	https://first-avenue.com/wp-content/uploads/2024/12/VVolfMask-011825-1080x1669-1.jpg	205	2025-01-18 19:00:00	46	VVOLF MASK, Caustic Abyss, Cobra Czar, Nekrotisk, Den of Thieves	2024-12-22 21:13:48.557733	2024-12-22 21:13:48.557733	f
https://first-avenue.com/event/2025-01-jamie-xx/	https://first-avenue.com/wp-content/uploads/2024/10/Jamiexx-011825-1080v1.jpg	207	2025-01-18 19:00:00	5	Jamie xx, Numero Group DJs	2024-12-22 21:13:50.976152	2024-12-22 21:13:50.976152	f
https://first-avenue.com/event/2025-01-lutalo/	https://first-avenue.com/wp-content/uploads/2024/10/Lutalo-011825-1080.jpg	206	2025-01-18 19:00:00	1	Lutalo, runo plum	2024-12-22 21:13:49.700625	2024-12-22 21:13:49.700625	f
https://first-avenue.com/event/2025-01-jukebox-the-ghost-sat/	https://first-avenue.com/wp-content/uploads/2024/10/JukeboxTheGhost-Jan2025-1080x1669-1.jpg	209	2025-01-18 20:00:00	7	Jukebox the Ghost	2024-12-22 21:13:52.504211	2024-12-22 21:13:52.504211	f
https://first-avenue.com/event/2025-01-happy-birthday-janis/	https://first-avenue.com/wp-content/uploads/2024/09/HappyBirthdayJanis-011825-1080.jpg	208	2025-01-18 20:00:00	50		2024-12-22 21:13:52.116313	2024-12-22 21:13:52.116313	f
https://first-avenue.com/event/2025-01-isoxo/	https://first-avenue.com/wp-content/uploads/2024/10/ISOxo-Jan25-1080.jpg	210	2025-01-18 20:30:00	8	ISOxo	2024-12-22 21:13:54.257988	2024-12-22 21:13:54.257988	f
https://first-avenue.com/event/2025-01-charlie-parr-wk3/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	211	2025-01-19 19:30:00	46	Charlie Parr, Laurel Premo	2024-12-22 21:13:55.5786	2024-12-22 21:13:55.5786	f
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk3/	https://first-avenue.com/wp-content/uploads/2024/10/cactusblossoms-012025-1080.jpg	212	2025-01-20 19:30:00	46	The Cactus Blossoms, Hilary Thavis and Doug Otto	2024-12-22 21:13:57.06766	2024-12-22 21:13:57.06766	f
https://first-avenue.com/event/2025-01-ben-barnes/	https://first-avenue.com/wp-content/uploads/2024/10/BenBarnes-012125-1080x1669v1.jpg	213	2025-01-21 20:00:00	7	Ben Barnes, Charles Jones, Sophia James, Zoe Sparks	2024-12-22 21:13:58.709749	2024-12-22 21:13:58.709749	f
https://link.dice.fm/K1547b6011bf?pid=1d4479ef	https://dice-media.imgix.net/attachments/2025-01-05/6f3bcb62-2dd3-4d17-bca4-eeed1973478b.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	4954	2025-02-15 18:30:00	32	Lungs + Too Late, But Still + Friends	2025-01-07 09:50:30.192937	2025-01-07 09:50:30.192937	f
https://palmers-bar.com/calendar/akj6wxakwy9hmg4-59dj3-kgmj8-hj3cj-ndlaf-w468n-2y872	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/c8a7387a-40bd-42bf-aa15-0bfe902f5e70/photo1+2.jpg	4904	2025-01-20 20:00:00	37	COWAOKE with BEN MOOOKER	2025-01-04 18:57:29.018153	2025-01-04 18:57:29.018153	f
https://first-avenue.com/event/2025-01-christian-lee-hutson/	https://first-avenue.com/wp-content/uploads/2024/11/ChristianLeeHutson-012425-1080.jpg	217	2025-01-24 19:30:00	1	Christian Lee Hutson, Allegra Krieger	2024-12-22 21:14:05.292138	2024-12-22 21:14:05.292138	f
https://first-avenue.com/event/2025-01-the-current-20th-anniversary-fri/	https://first-avenue.com/wp-content/uploads/2024/10/CURR-20-012425-1080.jpg	216	2025-01-24 19:30:00	8	Frank Black, she's green, DJ Jake Rudh	2024-12-22 21:14:04.679216	2024-12-22 21:14:04.679216	f
https://first-avenue.com/event/2025-01-glaive/	https://first-avenue.com/wp-content/uploads/2024/10/Glaive-012425-1080.jpg	218	2025-01-24 19:30:00	7	glaive	2024-12-22 21:14:06.825972	2024-12-22 21:14:06.825972	f
https://first-avenue.com/event/2025-01-mcnasty-brass-band/	https://first-avenue.com/wp-content/uploads/2024/12/McNastyBrassBand-012425-1080.jpg	220	2025-01-24 20:00:00	46	McNasty Brass Band, Dilly Dally Alley, Obi Original, The Black Atlantics	2024-12-22 21:14:08.616394	2024-12-22 21:14:08.616394	f
https://first-avenue.com/event/2025-01-tribute-to-the-last-waltz-fri/	https://first-avenue.com/wp-content/uploads/2024/09/TheLastWaltz-Jan2025-1080x1669-1.jpg	219	2025-01-24 20:00:00	50	Big Pink (Last Waltz tribute), Lamont Cranston	2024-12-22 21:14:07.284486	2024-12-22 21:14:07.284486	f
https://first-avenue.com/event/2025-01-the-current-20th-anniversary-sat/	https://first-avenue.com/wp-content/uploads/2024/10/CURR-20-012525-1080.jpg	221	2025-01-25 19:30:00	8	Beach Bunny, Bad Bad Hats, MAKR AN ERIS	2024-12-22 21:14:10.026302	2024-12-22 21:14:10.026302	f
https://first-avenue.com/event/2025-01-terrapin-flyer/	https://first-avenue.com/wp-content/uploads/2024/09/TerrapinFlyer-012525-1080.jpg	223	2025-01-25 20:00:00	46	Terrapin Flyer	2024-12-22 21:14:11.889987	2024-12-22 21:14:11.889987	f
https://first-avenue.com/event/2025-01-tribute-to-the-last-waltz-sat/	https://first-avenue.com/wp-content/uploads/2024/09/TheLastWaltz-Jan2025-1080x1669-1.jpg	222	2025-01-25 20:00:00	50	Big Pink (Last Waltz tribute), The Belfast Cowboys	2024-12-22 21:14:10.423647	2024-12-22 21:14:10.423647	f
https://first-avenue.com/event/2025-01-the-vaccines/	https://first-avenue.com/wp-content/uploads/2024/09/TheVaccines-012525-1080.jpg	224	2025-01-25 20:30:00	7	The Vaccines, THUS LOVE	2024-12-22 21:14:12.393029	2024-12-22 21:14:12.393029	f
https://first-avenue.com/event/2025-01-too-much-love/	https://first-avenue.com/wp-content/uploads/2024/12/TooMuchLove-012525-1080.jpg	225	2025-01-25 21:00:00	1	Too Much Love	2024-12-22 21:14:13.7664	2024-12-22 21:14:13.7664	f
https://first-avenue.com/event/2025-01-charlie-parr-wk4/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	226	2025-01-26 19:30:00	46	Charlie Parr, Paper Wings	2024-12-22 21:14:16.031345	2024-12-22 21:14:16.031345	f
https://first-avenue.com/event/2025-01-sean-rowe/	https://first-avenue.com/wp-content/uploads/2024/10/SeanRowe-012625-1080v1.jpg	227	2025-01-26 20:00:00	1	Sean Rowe, Social Animals (solo)	2024-12-22 21:14:17.299949	2024-12-22 21:14:17.299949	f
https://first-avenue.com/event/2025-01-rubblebucket/	https://first-avenue.com/wp-content/uploads/2024/09/Rubblebucket-012625-1080.jpg	228	2025-01-26 20:00:00	2	Rubblebucket, Hannah Mohan	2024-12-22 21:14:18.697197	2024-12-22 21:14:18.697197	f
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk4/	https://first-avenue.com/wp-content/uploads/2024/10/cactusblossoms-012725-1080.jpg	229	2025-01-27 19:30:00	46	The Cactus Blossoms, Erin Rae	2024-12-22 21:14:19.835812	2024-12-22 21:14:19.835812	f
https://first-avenue.com/event/2025-01-geordie-greep/	https://first-avenue.com/wp-content/uploads/2024/11/GeordieGreep-012725-1080-FA.jpg	230	2025-01-27 20:00:00	8	Geordie Greep, NNAMDÏ	2024-12-22 21:14:21.198118	2024-12-22 21:14:21.198118	f
https://first-avenue.com/event/2025-01-the-backfires/	https://first-avenue.com/wp-content/uploads/2024/10/TheBackfires-012825-1080v1.jpg	231	2025-01-28 19:00:00	1	The Backfires, Foxtide	2024-12-22 21:14:21.578811	2024-12-22 21:14:21.578811	f
https://first-avenue.com/event/2025-01-the-get-up-kids/	https://first-avenue.com/wp-content/uploads/2024/11/TheGetUpKids-012825-1080v1.jpg	232	2025-01-28 20:00:00	7	The Get Up Kids, Smoking Popes	2024-12-22 21:14:22.773305	2024-12-22 21:14:22.773305	f
https://first-avenue.com/event/2025-01-king-buffalo/	https://first-avenue.com/wp-content/uploads/2024/11/KingBuffalo-012825-1080x1669v1.jpg	233	2025-01-28 20:00:00	46	King Buffalo, Jr Parks	2024-12-22 21:14:24.011405	2024-12-22 21:14:24.011405	f
https://first-avenue.com/event/2025-01-tim-heidecker/	https://first-avenue.com/wp-content/uploads/2024/09/TImHeidecker-012925-1080x1424-1.jpg	234	2025-01-29 20:00:00	8	Tim Heidecker, Neil Hamburger	2024-12-22 21:14:25.375479	2024-12-22 21:14:25.375479	f
https://first-avenue.com/event/2025-01-burning-blue-rain/	https://first-avenue.com/wp-content/uploads/2024/12/BurningBlueRain-012925-1080.jpg	235	2025-01-29 20:00:00	1	Burning Blue Rain, Saltydog, Lighter Co.	2024-12-22 21:14:26.679435	2024-12-22 21:14:26.679435	f
https://first-avenue.com/event/2025-01-lazer-dim-700/	https://first-avenue.com/wp-content/uploads/2024/06/LazerDim700-013025-1080v1.jpg	236	2025-01-30 19:30:00	1	Lazer Dim 700, Slimesito	2024-12-22 21:14:27.952871	2024-12-22 21:14:27.952871	f
https://first-avenue.com/event/2025-01-eric-mayson/	https://first-avenue.com/wp-content/uploads/2024/12/EricMayson-013025-1080x1669-1.jpg	237	2025-01-30 19:30:00	46	Eric Mayson, TABAH, 26 BATS!, LaSalle	2024-12-22 21:14:29.196928	2024-12-22 21:14:29.196928	f
https://first-avenue.com/event/2025-01-mike-dawes/	https://first-avenue.com/wp-content/uploads/2024/09/MikeDawes-013124-1080.jpg	239	2025-01-31 20:00:00	7	Mike Dawes	2024-12-22 21:14:30.862239	2024-12-22 21:14:30.862239	f
https://first-avenue.com/event/2025-01-porridge-radio/	https://first-avenue.com/wp-content/uploads/2024/08/PorridgeRadio-013125-1080v1.jpg	240	2025-01-31 20:30:00	1	Porridge Radio, Sluice	2024-12-22 21:14:32.123339	2024-12-22 21:14:32.123339	f
https://first-avenue.com/event/2025-01-solid-gold/	https://first-avenue.com/wp-content/uploads/2024/12/SolidGold-013125-1080.jpg	241	2025-01-31 21:00:00	46	Solid Gold, vlush	2024-12-22 21:14:33.504392	2024-12-22 21:14:33.504392	f
https://first-avenue.com/event/2025-02-the-dirty-nil/	https://first-avenue.com/wp-content/uploads/2024/09/TheDirtyNil-020125-1080.jpg	242	2025-02-01 19:00:00	1	The Dirty Nil, Grumpster, House & Home	2024-12-22 21:14:36.888176	2024-12-22 21:14:36.888176	f
https://first-avenue.com/event/2025-02-2hollis/	https://first-avenue.com/wp-content/uploads/2024/10/2Hollis-020125-1080x1669v1.jpg	243	2025-02-01 19:00:00	2	2hollis, nate sib	2024-12-22 21:14:38.269006	2024-12-22 21:14:38.269006	f
https://first-avenue.com/event/2025-02-dylan-marlowe/	https://first-avenue.com/wp-content/uploads/2024/10/DylanMarlowe-020125-1080v2.jpg	244	2025-02-01 19:30:00	7	Dylan Marlowe, Brian Fuller	2024-12-22 21:14:39.599862	2024-12-22 21:14:39.599862	f
https://first-avenue.com/event/2025-02-jeremie-albino/	https://first-avenue.com/wp-content/uploads/2024/09/JeremieAlbino-020125-1080x1669-1.jpg	245	2025-02-01 20:00:00	46	Jeremie Albino, Benjamin Dakota Rogers	2024-12-22 21:14:40.863179	2024-12-22 21:14:40.863179	f
https://first-avenue.com/event/2025-02-magic-city-hippies/	https://first-avenue.com/wp-content/uploads/2024/10/MagicCityHippies-020125-1080x1669-1.jpg	246	2025-02-01 20:30:00	8	Magic City Hippies, Mustard Service	2024-12-22 21:14:42.066661	2024-12-22 21:14:42.066661	f
https://first-avenue.com/event/2025-01-tom-the-mail-man/	https://first-avenue.com/wp-content/uploads/2024/06/TomTheMailMan-012325-1080.jpg	215	2025-01-23 19:00:00	1	Tom The Mail Man, Tahj Keeton	2024-12-22 21:14:02.332534	2024-12-22 21:14:02.332534	f
https://www.berlinmpls.com/calendar/jeremy-walker-3	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/82932742-0880-42f9-90d8-3ece9ed474a9/Jeremy+Walker.jpeg	3827	2025-01-16 16:30:00	12	Early Evening Jazz: Jeremy Walker	2025-01-04 16:48:42.668096	2025-01-04 16:48:42.668096	f
https://link.dice.fm/y3ea291aaeec?pid=1d4479ef	https://dice-media.imgix.net/attachments/2025-01-03/a2f2a36e-5de5-479a-9f79-8ec9ab0c2aef.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	4957	2025-03-06 19:00:00	32	Whores, Facet and TBA	2025-01-07 09:50:30.192937	2025-01-07 09:50:30.192937	f
https://first-avenue.com/event/2025-02-lauren-mayberry/	https://first-avenue.com/wp-content/uploads/2024/10/LaurenMayberry-020325-1080x1669-1.jpg	250	2025-02-03 20:00:00	7	Lauren Mayberry	2024-12-22 21:14:46.44946	2024-12-22 21:14:46.44946	f
https://first-avenue.com/event/2025-02-donny-benet/	https://first-avenue.com/wp-content/uploads/2024/09/DonnyBenet-022525-1080.jpg	252	2025-02-05 20:00:00	2	Donny Benét	2024-12-22 21:14:49.834907	2024-12-22 21:14:49.834907	f
https://first-avenue.com/event/2025-02-toro-y-moi-panda-bear/	https://first-avenue.com/wp-content/uploads/2024/10/ToroyMoi-020625-1080x1669-1.jpg	253	2025-02-06 19:30:00	8	Toro y Moi, Panda Bear, Nourished By Time	2024-12-22 21:14:51.201379	2024-12-22 21:14:51.201379	f
https://first-avenue.com/event/2025-02-max-mcnown-wed/	https://first-avenue.com/wp-content/uploads/2024/09/MaxMcNown-020525-1080.jpg	251	2025-02-05 20:00:00	1	Max McNown, Theo Kandel	2024-12-22 21:14:48.797954	2024-12-22 21:14:48.797954	f
https://first-avenue.com/event/2025-02-max-mcnown/	https://first-avenue.com/wp-content/uploads/2024/09/MaxMcNown-020625-1080.jpg	254	2025-02-06 20:00:00	1	Max McNown, Theo Kandel	2024-12-22 21:14:52.241292	2024-12-22 21:14:52.241292	f
https://first-avenue.com/event/2025-02-quarter-life-crisis/	https://first-avenue.com/wp-content/uploads/2024/12/PopPunkProm-020725-1080x1669-1.jpg	255	2025-02-07 20:00:00	7	Quarter Life Crisis, Joey Bonner	2024-12-22 21:14:53.423327	2024-12-22 21:14:53.423327	f
https://first-avenue.com/event/2025-02-the-sound-of-gospel-sat/	https://first-avenue.com/wp-content/uploads/2024/10/soundofgospel_Feb2025-1080.jpg	256	2025-02-08 19:00:00	50		2024-12-22 21:14:54.573087	2024-12-22 21:14:54.573087	f
https://first-avenue.com/event/2025-02-the-brothers-allmanac/	https://first-avenue.com/wp-content/uploads/2024/12/TheBrothersAllmanac-020825-1080x1669v1.jpg	257	2025-02-08 20:00:00	8	The Brothers Allmanac, Slippery People (The Music of Talking Heads)	2024-12-22 21:14:55.851894	2024-12-22 21:14:55.851894	f
https://first-avenue.com/event/2025-02-eggy/	https://first-avenue.com/wp-content/uploads/2024/11/Eggy-020825-1080.jpg	259	2025-02-08 20:30:00	7	Eggy	2024-12-22 21:14:58.09795	2024-12-22 21:14:58.09795	f
https://first-avenue.com/event/2025-02-slynk-and-phyphr/	https://first-avenue.com/wp-content/uploads/2024/12/Phyphr-Slynk-020825-1080.jpg	260	2025-02-08 21:00:00	1	Slynk, Phyphr	2024-12-22 21:14:59.303002	2024-12-22 21:14:59.303002	f
https://first-avenue.com/event/2025-02-god-bullies/	https://first-avenue.com/wp-content/uploads/2024/12/GodBullies-020825-1080.jpg	258	2025-02-08 20:30:00	46	God Bullies	2024-12-22 21:14:57.003809	2024-12-22 21:14:57.003809	f
https://first-avenue.com/event/2025-02-the-sound-of-gospel-sun/	https://first-avenue.com/wp-content/uploads/2024/10/soundofgospel_Feb2025-1080.jpg	261	2025-02-09 15:00:00	50		2024-12-22 21:15:00.673861	2024-12-22 21:15:00.673861	f
https://first-avenue.com/event/2025-02-070-shake/	https://first-avenue.com/wp-content/uploads/2024/11/070Shake-020925-1080v0.jpg	262	2025-02-09 20:00:00	8	070 Shake, Bryant Barnes, Johan Lenox	2024-12-22 21:15:02.099885	2024-12-22 21:15:02.099885	f
https://first-avenue.com/event/2025-02-eddie-9v/	https://first-avenue.com/wp-content/uploads/2024/10/Eddie9V-021125-1080v1.jpg	263	2025-02-11 20:00:00	1	Eddie 9V, Cousin Curtiss	2024-12-22 21:15:03.89674	2024-12-22 21:15:03.89674	f
https://first-avenue.com/event/2025-02-uncle-acid-the-deadbeats/	https://first-avenue.com/wp-content/uploads/2024/10/UncleAcid-021325-1080x1488-1.jpg	264	2025-02-13 20:00:00	50	Uncle Acid & the Deadbeats, Jonathan Hultén	2024-12-22 21:15:05.373663	2024-12-22 21:15:05.373663	f
https://first-avenue.com/event/2025-02-rachel-grae/	https://first-avenue.com/wp-content/uploads/2024/10/RachelGrae-021425-1080.jpg	265	2025-02-14 19:00:00	1	Rachel Grae	2024-12-22 21:15:06.960477	2024-12-22 21:15:06.960477	f
https://first-avenue.com/event/2025-01-sapphic-factory/	https://first-avenue.com/wp-content/uploads/2024/12/SapphicFactory-021425-1000.jpg	267	2025-02-14 21:00:00	7	sapphic factory: queer joy party	2024-12-22 21:15:08.803598	2024-12-22 21:15:08.803598	f
https://first-avenue.com/event/2025-02-good-kid/	https://first-avenue.com/wp-content/uploads/2024/10/GoodKid-021525-1080.jpg	268	2025-02-15 19:00:00	8	Good Kid, Phoneboy	2024-12-22 21:15:10.088639	2024-12-22 21:15:10.088639	f
https://first-avenue.com/event/2025-02-blind-pilot/	https://first-avenue.com/wp-content/uploads/2024/09/BlindPilot-021525-1080v1.jpg	270	2025-02-15 20:00:00	7	Blind Pilot, Kacy & Clayton	2024-12-22 21:15:11.799759	2024-12-22 21:15:11.799759	f
https://first-avenue.com/event/2025-02-michigan-rattlers/	https://first-avenue.com/wp-content/uploads/2024/11/MichiganRattlers-021525-1080v1.jpg	271	2025-02-15 20:30:00	1	Michigan Rattlers, Elias Hix	2024-12-22 21:15:13.065566	2024-12-22 21:15:13.065566	f
https://first-avenue.com/event/2025-02-dua-saleh/	https://first-avenue.com/wp-content/uploads/2024/10/DuaSaleh-021625-1080x1602-1.jpg	272	2025-02-16 19:30:00	7	Dua Saleh, XINA, SoulFlower	2024-12-22 21:15:14.25406	2024-12-22 21:15:14.25406	f
https://first-avenue.com/event/2025-02-benjamin-booker/	https://first-avenue.com/wp-content/uploads/2024/10/BenjaminBooker-021625-1080x1513-1.jpg	273	2025-02-16 20:00:00	46	Benjamin Booker, Kenny Segal	2024-12-22 21:15:15.5151	2024-12-22 21:15:15.5151	f
https://first-avenue.com/event/2025-02-jarv/	https://first-avenue.com/wp-content/uploads/2024/09/JARV-021625-1080.jpg	274	2025-02-16 20:00:00	1	Jarv, King Green, Damn Skippy	2024-12-22 21:15:16.568136	2024-12-22 21:15:16.568136	f
https://first-avenue.com/event/2025-02-jordana/	https://first-avenue.com/wp-content/uploads/2024/10/Jordana-021725-1080.jpg	275	2025-02-17 19:00:00	1	Jordana, Rachel Bobbitt	2024-12-22 21:15:17.860051	2024-12-22 21:15:17.860051	f
https://first-avenue.com/event/2025-02-a-r-i-z-o-n-a/	https://first-avenue.com/wp-content/uploads/2024/10/Arizona-021925-1080v1.jpg	276	2025-02-19 19:30:00	8	A R I Z O N A, Moody Joody	2024-12-22 21:15:18.978006	2024-12-22 21:15:18.978006	f
https://first-avenue.com/event/2025-02-boombox/	https://first-avenue.com/wp-content/uploads/2024/11/BoomBox-021925-1080.jpg	278	2025-02-19 20:00:00	7	BoomBox	2024-12-22 21:15:21.17572	2024-12-22 21:15:21.17572	f
https://first-avenue.com/event/2025-02-stephen-day/	https://first-avenue.com/wp-content/uploads/2024/11/StephenDay-021925-1080.jpg	277	2025-02-19 20:00:00	1	Stephen Day	2024-12-22 21:15:20.193429	2024-12-22 21:15:20.193429	f
https://first-avenue.com/event/2025-02-skinny-lister/	https://first-avenue.com/wp-content/uploads/2024/11/SkinnyLister-022025-1080x1338-1.jpg	280	2025-02-20 19:30:00	1	Skinny Lister	2024-12-22 21:15:23.471858	2024-12-22 21:15:23.471858	f
https://first-avenue.com/event/2025-02-muscadine-bloodline/	https://first-avenue.com/wp-content/uploads/2024/10/MuscadineBloodline-022125-1080v1.jpg	281	2025-02-21 20:00:00	8	Muscadine Bloodline, Lance Roark	2024-12-22 21:15:24.841717	2024-12-22 21:15:24.841717	f
https://first-avenue.com/event/2025-02-free-fallin-our-house-taming-the-tiger/	https://first-avenue.com/wp-content/uploads/2024/10/FreeFallinTribute-022225-1080x1669-1.jpg	283	2025-02-22 20:00:00	50	Free Fallin (The Tom Petty Concert Experience), Our House (A Tribute to Crosby, Stills, Nash, & Young), Taming the Tiger (Joni Mitchell Tribute)	2024-12-22 21:15:27.183392	2024-12-22 21:15:27.183392	f
https://first-avenue.com/event/2025-02-ron-pope/	https://first-avenue.com/wp-content/uploads/2024/08/RonPope-022225-1080.jpg	282	2025-02-22 20:00:00	46	Ron Pope, Andrea von Kampen	2024-12-22 21:15:25.902096	2024-12-22 21:15:25.902096	f
https://first-avenue.com/event/2025-02-ax-and-the-hatchetmen/	https://first-avenue.com/wp-content/uploads/2024/08/AxHatchetmen-022225-1080x1669v1.jpg	285	2025-02-22 20:00:00	1	Ax and the Hatchetmen, Easy Honey	2024-12-22 21:15:28.899273	2024-12-22 21:15:28.899273	f
https://first-avenue.com/event/2025-02-molchat-doma/	https://first-avenue.com/wp-content/uploads/2024/08/MolchatDoma-022225-1080.jpg	286	2025-02-22 20:30:00	8	Molchat Doma, Sextile	2024-12-22 21:15:29.30085	2024-12-22 21:15:29.30085	f
https://first-avenue.com/event/2025-02-kxllswxtch-and-sxmpra/	https://first-avenue.com/wp-content/uploads/2024/10/Kxllswxtch-Sxmpra-022325-1080x1669-1.jpg	287	2025-02-23 19:00:00	2	Kxllswxtch, SXMPRA	2024-12-22 21:15:29.751722	2024-12-22 21:15:29.751722	f
https://first-avenue.com/event/2025-02-kelsy-karter-the-heroines/	https://first-avenue.com/wp-content/uploads/2024/11/KelsyKarter-022325-1080.jpg	289	2025-02-23 20:00:00	1	Kelsy Karter & The Heroines	2024-12-22 21:15:32.284861	2024-12-22 21:15:32.284861	f
https://first-avenue.com/event/2025-02-post-sex-nachos/	https://first-avenue.com/wp-content/uploads/2024/11/PostSexNachos-022525-1080v1.jpg	290	2025-02-25 20:00:00	1	Post Sex Nachos, VEAUX	2024-12-22 21:15:33.664011	2024-12-22 21:15:33.664011	f
https://first-avenue.com/event/2025-02-pink-sweats/	https://first-avenue.com/wp-content/uploads/2024/11/PinkSweats-022325-1080.jpg	288	2025-02-23 20:00:00	50	Pink Sweat$, Aqyila	2024-12-22 21:15:31.107043	2024-12-22 21:15:31.107043	f
https://first-avenue.com/event/2025-02-the-high-kings/	https://first-avenue.com/wp-content/uploads/2024/09/TheHighKings-022625-1080.jpg	291	2025-02-26 19:30:00	50	The High Kings	2024-12-22 21:15:35.039515	2024-12-22 21:15:35.039515	f
https://first-avenue.com/event/2025-02-nina-luna/	https://first-avenue.com/wp-content/uploads/2024/12/NinaLuna-022625-1080.jpg	292	2025-02-26 19:30:00	1	Nina Luna, anni xo, Harlow, Emily Rhea	2024-12-22 21:15:36.507354	2024-12-22 21:15:36.507354	f
https://first-avenue.com/event/2025-02-blockhead/	https://first-avenue.com/wp-content/uploads/2024/12/Blockhead-022725-1080.jpg	293	2025-02-27 20:30:00	1	Blockhead, Shrimpnose	2024-12-22 21:15:37.769275	2024-12-22 21:15:37.769275	f
https://first-avenue.com/event/2025-02-missio/	https://first-avenue.com/wp-content/uploads/2024/11/MISSIO-022825-1080.jpg	294	2025-02-28 20:00:00	2	MISSIO, Layto	2024-12-22 21:15:38.956034	2024-12-22 21:15:38.956034	f
https://first-avenue.com/event/2025-02-fink/	https://first-avenue.com/wp-content/uploads/2024/09/Fink-022825-1080.jpg	296	2025-02-28 20:00:00	1	Fink	2024-12-22 21:15:41.09176	2024-12-22 21:15:41.09176	f
https://first-avenue.com/event/2025-03-cochise/	https://first-avenue.com/wp-content/uploads/2024/11/Cochise-030125-1080.jpg	297	2025-03-01 19:30:00	7	Cochise, TisaKorean	2024-12-22 21:15:43.863742	2024-12-22 21:15:43.863742	f
https://first-avenue.com/event/2025-03-grace-enger/	https://first-avenue.com/wp-content/uploads/2024/12/GraceEnger-030125-1080.jpg	298	2025-03-01 19:30:00	1	Grace Enger, jake minch	2024-12-22 21:15:45.002337	2024-12-22 21:15:45.002337	f
https://first-avenue.com/event/2025-03-michael-marcagi/	https://first-avenue.com/wp-content/uploads/2024/10/MichaelMarcagi-030125-1080v1.jpg	299	2025-03-01 20:00:00	8	Michael Marcagi, Ashley Kutcher	2024-12-22 21:15:46.14578	2024-12-22 21:15:46.14578	f
https://first-avenue.com/event/2025-03-pert-near-sandstone/	https://first-avenue.com/wp-content/uploads/2024/11/PertNearSandstone-Winter2025-1080x1669-1.jpg	300	2025-03-01 20:00:00	46	Pert Near Sandstone, Bronwyn Keith-Hynes, Feeding Leroy	2024-12-22 21:15:47.499241	2024-12-22 21:15:47.499241	f
https://first-avenue.com/event/2025-03-drew-and-ellie-holcomb/	https://first-avenue.com/wp-content/uploads/2024/10/DrewEllieHolcomb-030225-1080x1440v0.jpg	302	2025-03-02 19:00:00	50	DREW AND ELLIE HOLCOMB	2024-12-22 21:15:49.694423	2024-12-22 21:15:49.694423	f
https://first-avenue.com/event/2025-03-thrown/	https://first-avenue.com/wp-content/uploads/2024/11/Thrown-030225-1080.jpg	303	2025-03-02 20:00:00	7	thrown, Varials, No Cure, Heavensgate	2024-12-22 21:15:50.804406	2024-12-22 21:15:50.804406	f
https://first-avenue.com/event/2025-03-the-sloppy-boys/	https://first-avenue.com/wp-content/uploads/2024/12/TheSloppyBoys-030224-1080x1669-1.jpg	304	2025-03-02 20:00:00	2	The Sloppy Boys	2024-12-22 21:15:51.976717	2024-12-22 21:15:51.976717	f
https://first-avenue.com/event/2025-03-mackenzy-mackay/	https://first-avenue.com/wp-content/uploads/2024/11/MackenzyMackay-030425-1080.jpg	305	2025-03-04 19:30:00	1	Mackenzy Mackay	2024-12-22 21:15:52.421212	2024-12-22 21:15:52.421212	f
https://first-avenue.com/event/2025-03-gunnar/	https://first-avenue.com/wp-content/uploads/2024/10/Gunnar-030525-1080.jpg	306	2025-03-05 19:30:00	1	GUNNAR	2024-12-22 21:15:53.573531	2024-12-22 21:15:53.573531	f
https://first-avenue.com/event/2025-03-twain-esther-rose/	https://first-avenue.com/wp-content/uploads/2024/10/Twain-030525-1080.jpg	307	2025-03-05 20:00:00	46	Twain, Esther Rose	2024-12-22 21:15:54.798517	2024-12-22 21:15:54.798517	f
https://first-avenue.com/event/2025-03-jack-kays/	https://first-avenue.com/wp-content/uploads/2024/10/JackKays-030625-1080v1.jpg	308	2025-03-06 19:30:00	7	Jack Kays, Remo Drive	2024-12-22 21:15:56.106014	2024-12-22 21:15:56.106014	f
https://first-avenue.com/event/2025-03-this-wild-life/	https://first-avenue.com/wp-content/uploads/2024/10/ThisWIldLife-030625-1080.jpg	309	2025-03-06 19:30:00	2	This Wild Life, Belmont, Young Culture	2024-12-22 21:15:57.488613	2024-12-22 21:15:57.488613	f
https://first-avenue.com/event/2025-03-k-flay/	https://first-avenue.com/wp-content/uploads/2024/10/KFlay-030625-1080.jpg	310	2025-03-06 20:00:00	8	K.Flay, Vienna Vienna	2024-12-22 21:15:58.442132	2024-12-22 21:15:58.442132	f
https://first-avenue.com/event/2025-03-hazlett/	https://first-avenue.com/wp-content/uploads/2024/11/Hazlett-030725-1080x1669-1.jpg	311	2025-03-07 19:30:00	7	Hazlett	2024-12-22 21:15:59.677491	2024-12-22 21:15:59.677491	f
https://first-avenue.com/event/2025-03-twin-cities-ballet-presents-romeo-juliet-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TCB-RJ-Mar2025-1080v0.jpg	312	2025-03-07 19:30:00	50	Twin Cities Ballet presentsRomeo & Juliet: The Rock Ballet, live music byMark Joseph's Dragon Attack	2024-12-22 21:16:01.159962	2024-12-22 21:16:01.159962	f
https://first-avenue.com/event/2025-03-morgan-wade/	https://first-avenue.com/wp-content/uploads/2024/10/MorganWade-030725-1080.jpg	313	2025-03-07 20:00:00	8	Morgan Wade, SPECIAL GUEST	2024-12-22 21:16:02.530075	2024-12-22 21:16:02.530075	f
https://first-avenue.com/event/2025-03-glixen/	https://first-avenue.com/wp-content/uploads/2024/11/Glixen-030725-1080.jpg	314	2025-03-07 20:30:00	1	Glixen, she's green, Linus	2024-12-22 21:16:03.914918	2024-12-22 21:16:03.914918	f
https://first-avenue.com/event/2025-03-dwllrs/	https://first-avenue.com/wp-content/uploads/2024/11/Dwllrs-030825-1080v1.jpg	315	2025-03-08 19:30:00	1	DWLLRS, doan	2024-12-22 21:16:05.189011	2024-12-22 21:16:05.189011	f
https://first-avenue.com/event/2025-03-twin-cities-ballet-presents-romeo-juliet-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TCB-RJ-Mar2025-1080v0.jpg	316	2025-03-08 19:30:00	50	Twin Cities Ballet presentsRomeo & Juliet: The Rock Ballet, live music byMark Joseph's Dragon Attack	2024-12-22 21:16:06.527899	2024-12-22 21:16:06.527899	f
https://first-avenue.com/event/2025-03-josh-meloy/	https://first-avenue.com/wp-content/uploads/2024/12/JoshMeloy-030825-1080x1669-1.jpg	317	2025-03-08 20:30:00	8	Josh Meloy, Kenny Feidler	2024-12-22 21:16:07.705387	2024-12-22 21:16:07.705387	f
https://first-avenue.com/event/2025-03-brant-bjork-trio/	https://first-avenue.com/wp-content/uploads/2024/12/BrantBjork-030825-1080.jpg	318	2025-03-08 21:00:00	46	The Brant Bjork Trio, Magic Castles, Van Glow Light Show	2024-12-22 21:16:08.977104	2024-12-22 21:16:08.977104	f
https://www.berlinmpls.com/calendar/0m0p43qfrfrj5i6ku75cef81u4omo1-cylbs-xng8n-je9ez-3y5gx-z4lpt	\N	3829	2025-01-17 16:00:00	12	Private Event	2025-01-04 16:48:47.057899	2025-01-04 16:48:47.057899	f
https://link.dice.fm/d3fcc1851ed1?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/811b9dcd-1c95-49d9-8246-3a4beca05f66.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	783	2025-01-21 19:00:00	32	Edith Head, The Customers, 13 Howell, Field Hospitals	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://first-avenue.com/event/2025-03-lolo/	https://first-avenue.com/wp-content/uploads/2024/10/LOLO-031125-1080x1669v1.jpg	321	2025-03-11 19:30:00	1	LØLØ, GUS	2024-12-22 21:16:13.382283	2024-12-22 21:16:13.382283	f
https://first-avenue.com/event/2024-03-michael-shannon-jason-narducy/	https://first-avenue.com/wp-content/uploads/2024/09/MichaelShannon-JasonNarducy-031225-1080x1669-1.jpg	322	2025-03-12 19:30:00	8	Michael Shannon, Jason Narducy, Dave Hill	2024-12-22 21:16:14.752644	2024-12-22 21:16:14.752644	f
https://first-avenue.com/event/2025-03-orions-belte/	https://first-avenue.com/wp-content/uploads/2024/09/OrionsBelte-031225-1080x1439v1.jpg	323	2025-03-12 19:30:00	1	Orions Belte, j ember	2024-12-22 21:16:16.179063	2024-12-22 21:16:16.179063	f
https://first-avenue.com/event/2025-03-soccer-mommy/	https://first-avenue.com/wp-content/uploads/2024/09/SoccerMommy-031325-1080x1669-1.jpg	324	2025-03-13 19:30:00	8	Soccer Mommy, Hana Vu	2024-12-22 21:16:17.49502	2024-12-22 21:16:17.49502	f
https://first-avenue.com/event/2025-03-jessica-baio/	https://first-avenue.com/wp-content/uploads/2024/11/JessicaBaio-031425-1080.jpg	325	2025-03-14 19:00:00	2	Jessica Baio	2024-12-22 21:16:18.800613	2024-12-22 21:16:18.800613	f
https://first-avenue.com/event/2025-03-macseal/	https://first-avenue.com/wp-content/uploads/2024/12/Macseal-031425-1080.jpg	326	2025-03-14 19:30:00	1	MACSEAL, Carly Cosgrove, buffchick	2024-12-22 21:16:20.199387	2024-12-22 21:16:20.199387	f
https://first-avenue.com/event/2025-03-emei/	https://first-avenue.com/wp-content/uploads/2024/09/Emei-031425-1080.jpg	327	2025-03-14 19:30:00	7	Emei	2024-12-22 21:16:21.380181	2024-12-22 21:16:21.380181	f
https://first-avenue.com/event/2025-03-jojo/	https://first-avenue.com/wp-content/uploads/2024/11/Jojo-031425-1080.jpg	328	2025-03-14 20:00:00	8	JoJo, Emmy Meli	2024-12-22 21:16:22.37528	2024-12-22 21:16:22.37528	f
https://first-avenue.com/event/2025-03-adrian-younge/	https://first-avenue.com/wp-content/uploads/2024/11/AdrianYounge-031425-1080x1399-1.jpg	329	2025-03-14 21:00:00	46	Adrian Younge	2024-12-22 21:16:23.91938	2024-12-22 21:16:23.91938	f
https://first-avenue.com/event/2025-03-maude-latour/	https://first-avenue.com/wp-content/uploads/2024/11/MaudeLatour-031525-1080.jpg	330	2025-03-15 19:00:00	2	Maude Latour, MARIS	2024-12-22 21:16:25.176593	2024-12-22 21:16:25.176593	f
https://first-avenue.com/event/2025-03-greensky-bluegrass/	https://first-avenue.com/wp-content/uploads/2024/12/GreenskyBluegrass-031525-1080x1299-1.jpg	331	2025-03-15 19:30:00	24	Greensky Bluegrass	2024-12-22 21:16:26.3198	2024-12-22 21:16:26.3198	f
https://first-avenue.com/event/2025-03-skegss/	https://first-avenue.com/wp-content/uploads/2024/10/Skegss-031524-1080x1669-1.jpg	332	2025-03-15 20:00:00	46	Skegss	2024-12-22 21:16:27.670765	2024-12-22 21:16:27.670765	f
https://first-avenue.com/event/2025-03-marc-broussard/	https://first-avenue.com/wp-content/uploads/2024/09/MarcBroussard-031525-1080x1669-1.jpg	333	2025-03-15 20:00:00	50	Marc Broussard, Kendra Morris	2024-12-22 21:16:29.060682	2024-12-22 21:16:29.060682	f
https://first-avenue.com/event/2025-03-andy-frasco-and-the-un/	https://first-avenue.com/wp-content/uploads/2024/11/AndyFrasco-031525-1080.jpg	334	2025-03-15 20:30:00	7	Andy Frasco & The U.N., Kris Lager	2024-12-22 21:16:30.215799	2024-12-22 21:16:30.215799	f
https://first-avenue.com/event/2025-03-ray-bull/	https://first-avenue.com/wp-content/uploads/2024/10/RayBull-031625-1080.jpg	335	2025-03-16 19:30:00	1	Ray Bull	2024-12-22 21:16:30.627315	2024-12-22 21:16:30.627315	f
https://first-avenue.com/event/2025-03-alcest/	https://first-avenue.com/wp-content/uploads/2024/09/Alcest-031725-1080v1.jpg	336	2025-03-17 19:30:00	7	Alcest, MONO, Kælan Mikla	2024-12-22 21:16:31.886529	2024-12-22 21:16:31.886529	f
https://first-avenue.com/event/2025-03-category-7/	https://first-avenue.com/wp-content/uploads/2024/10/Category7-031825-1080.jpg	337	2025-03-18 19:45:00	7	Category 7, Exhorder, Engineered Society Project, Hand Of The Tribe	2024-12-22 21:16:33.281417	2024-12-22 21:16:33.281417	f
https://first-avenue.com/event/2025-03-dead-man-winter/	https://first-avenue.com/wp-content/uploads/2024/12/DeadManWinter-032025-1080x1669-1.jpg	338	2025-03-20 19:30:00	8	Dead Man Winter, Little Fevers	2024-12-22 21:16:34.631846	2024-12-22 21:16:34.631846	f
https://first-avenue.com/event/2025-03-paula-poundstone/	https://first-avenue.com/wp-content/uploads/2024/07/PaulaPoundstone-032125-1080.jpg	339	2025-03-21 20:00:00	50	Paula Poundstone	2024-12-22 21:16:36.006239	2024-12-22 21:16:36.006239	f
https://first-avenue.com/event/2025-03-bj-barham/	https://first-avenue.com/wp-content/uploads/2024/12/BJBarham-032125-1080.jpg	340	2025-03-21 20:30:00	46	BJ Barham (American Aquarium Solo)	2024-12-22 21:16:37.428335	2024-12-22 21:16:37.428335	f
https://first-avenue.com/event/2025-03-flipturn/	https://first-avenue.com/wp-content/uploads/2024/10/flipturn-032225-1080.jpg	341	2025-03-22 19:30:00	24	flipturn	2024-12-22 21:16:38.573428	2024-12-22 21:16:38.573428	f
https://first-avenue.com/event/2025-03-russian-circles/	https://first-avenue.com/wp-content/uploads/2024/11/RussianCircles-032225-1080x1669-1.jpg	342	2025-03-22 20:30:00	7	Russian Circles, Pelican	2024-12-22 21:16:39.625456	2024-12-22 21:16:39.625456	f
https://first-avenue.com/event/2025-03-tobe-nwigwe/	https://first-avenue.com/wp-content/uploads/2024/10/TobeNwigwe-032325-1080.jpg	343	2025-03-23 19:30:00	8	Tobe Nwigwe	2024-12-22 21:16:40.657273	2024-12-22 21:16:40.657273	f
https://first-avenue.com/event/2025-03-tigran-hamasyan/	https://first-avenue.com/wp-content/uploads/2024/11/TigranHamasyan-032325-1080.jpg	344	2025-03-23 20:00:00	7	Tigran Hamasyan	2024-12-22 21:16:41.731763	2024-12-22 21:16:41.731763	f
https://first-avenue.com/event/2025-03-lilly-hiatt/	https://first-avenue.com/wp-content/uploads/2024/11/LillyHiatt-032325-1080v0.jpg	345	2025-03-23 20:00:00	46	Lilly Hiatt	2024-12-22 21:16:42.957591	2024-12-22 21:16:42.957591	f
https://first-avenue.com/event/2024-03-maya-hawke/	https://first-avenue.com/wp-content/uploads/2024/09/MayaHawke-032425-1080.jpg	346	2025-03-24 19:00:00	24	Maya Hawke, Katy Kirby	2024-12-22 21:16:43.990186	2024-12-22 21:16:43.990186	f
https://first-avenue.com/event/2025-03-hovvdy/	https://first-avenue.com/wp-content/uploads/2024/10/Hovvdy-032425-1080.jpg	347	2025-03-24 20:00:00	46	Hovvdy, Video Age	2024-12-22 21:16:45.154854	2024-12-22 21:16:45.154854	f
https://first-avenue.com/event/2025-03-giovannie-and-the-hired-guns/	https://first-avenue.com/wp-content/uploads/2024/12/GiovannieHiredGuns-032525-1080.jpg	348	2025-03-25 20:00:00	7	Giovannie and the Hired Guns	2024-12-22 21:16:46.316677	2024-12-22 21:16:46.316677	f
https://first-avenue.com/event/2024-03-donavon-frankenreiter/	https://first-avenue.com/wp-content/uploads/2024/11/DonavonFrankenreiter-032525-1080.jpg	349	2025-03-25 20:00:00	46	Donavon Frankenreiter	2024-12-22 21:16:46.780435	2024-12-22 21:16:46.780435	f
https://first-avenue.com/event/2025-03-lunar-vacation/	https://first-avenue.com/wp-content/uploads/2024/12/LunarVacation-032625-1080x1304-1.jpg	350	2025-03-26 20:00:00	1	Lunar Vacation	2024-12-22 21:16:48.02699	2024-12-22 21:16:48.02699	f
https://first-avenue.com/event/2025-03-the-war-and-treaty/	https://first-avenue.com/wp-content/uploads/2024/12/WarAndTreaty-032625-1080x1250-1.jpg	351	2025-03-26 20:00:00	7	The War and Treaty	2024-12-22 21:16:49.104875	2024-12-22 21:16:49.104875	f
https://first-avenue.com/event/2024-03-marc-scibilia/	https://first-avenue.com/wp-content/uploads/2024/09/MarcScibilia-032725-1080x1570-1.jpg	352	2025-03-27 19:30:00	7	Marc Scibilia	2024-12-22 21:16:49.501905	2024-12-22 21:16:49.501905	f
https://first-avenue.com/event/2025-03-high-fade/	https://first-avenue.com/wp-content/uploads/2024/12/HighFade-032725-1080v0.jpg	353	2025-03-27 20:00:00	1	High Fade, Purple Funk Metropolis	2024-12-22 21:16:50.866455	2024-12-22 21:16:50.866455	f
https://first-avenue.com/event/2025-03-sunny-sweeney/	https://first-avenue.com/wp-content/uploads/2024/06/SunnySweeney-031024-1080x1350-1.jpg	320	2025-03-10 20:00:00	46	Sunny Sweeney, Cam Pierce	2024-12-22 21:16:12.067209	2024-12-22 21:16:12.067209	f
https://link.dice.fm/k93b74448495?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/6b55fb7b-9469-4e37-a87f-3d686487bad9.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	785	2025-01-31 18:30:00	32	Ancient Waves, Betty Won't, Ciao Bello	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://first-avenue.com/event/2025-03-vansire/	https://first-avenue.com/wp-content/uploads/2024/09/Vansire-032825-1080x1669-1.jpg	355	2025-03-28 20:30:00	7	Vansire, JORDANN	2024-12-22 21:16:52.708108	2024-12-22 21:16:52.708108	f
https://first-avenue.com/event/2025-03-zz-ward/	https://first-avenue.com/wp-content/uploads/2024/10/ZZWard-032925-1080v1.jpg	357	2025-03-29 20:00:00	50	ZZ Ward, Liam St. John	2024-12-22 21:16:54.389018	2024-12-22 21:16:54.389018	f
https://first-avenue.com/event/2025-03-wax-tailor/	https://first-avenue.com/wp-content/uploads/2024/09/WaxTailor-032925-1080v1.jpg	358	2025-03-29 20:00:00	7	Wax Tailor, Napoleon Da Legend	2024-12-22 21:16:55.523425	2024-12-22 21:16:55.523425	f
https://first-avenue.com/event/2025-03-the-rocket-summer/	https://first-avenue.com/wp-content/uploads/2024/11/TheRocketSummer-032925-1080.jpg	359	2025-03-29 20:00:00	46	The Rocket Summer, Mae	2024-12-22 21:16:56.568038	2024-12-22 21:16:56.568038	f
https://first-avenue.com/event/2024-03-snow-patrol/	https://first-avenue.com/wp-content/uploads/2024/09/SnowPatrol-033125-1080.jpg	360	2025-03-31 19:30:00	24	Snow Patrol	2024-12-22 21:16:57.565923	2024-12-22 21:16:57.565923	f
https://first-avenue.com/event/2025-03-naked-giants/	https://first-avenue.com/wp-content/uploads/2024/11/NakedGiants-033125-1080.jpg	361	2025-03-31 20:00:00	1	Naked Giants, Girl and Girl	2024-12-22 21:16:58.627731	2024-12-22 21:16:58.627731	f
https://first-avenue.com/event/2024-04-arts-fishing-club/	https://first-avenue.com/wp-content/uploads/2024/11/ArtsFishingClub-040225-1080v1.jpg	362	2025-04-02 20:00:00	1	Arts Fishing Club, Brother Elsey	2024-12-22 21:17:01.437604	2024-12-22 21:17:01.437604	f
https://first-avenue.com/event/2025-04-sir-woman/	https://first-avenue.com/wp-content/uploads/2024/11/SirWoman-040225-1080.jpg	363	2025-04-02 20:00:00	46	Sir Woman	2024-12-22 21:17:01.941177	2024-12-22 21:17:01.941177	f
https://first-avenue.com/event/2025-04-the-birthday-massacre/	https://first-avenue.com/wp-content/uploads/2024/11/TheBirthdayMassacre-040225-1080.jpg	364	2025-04-02 20:00:00	7	The Birthday Massacre, Essenger, Magic Wands	2024-12-22 21:17:02.310956	2024-12-22 21:17:02.310956	f
https://first-avenue.com/event/2025-04-the-army-the-navy/	https://first-avenue.com/wp-content/uploads/2024/12/TheArmyTheNavy-040325-1080.jpg	365	2025-04-03 19:30:00	1	The Army, The Navy, Aggie Miller	2024-12-22 21:17:02.728209	2024-12-22 21:17:02.728209	f
https://first-avenue.com/event/2025-04-caravan-palace/	https://first-avenue.com/wp-content/uploads/2024/10/CaravanPalace-040325-1080x1669-1.jpg	366	2025-04-03 20:00:00	8	Caravan Palace, ZAYKA	2024-12-22 21:17:04.333917	2024-12-22 21:17:04.333917	f
https://first-avenue.com/event/2025-04-bright-eyes/	https://first-avenue.com/wp-content/uploads/2024/08/BrightEyes-040425-1080v1.jpg	367	2025-04-04 20:00:00	24	Bright Eyes, Cursive	2024-12-22 21:17:04.730879	2024-12-22 21:17:04.730879	f
https://first-avenue.com/event/2025-04-la-lom/	https://first-avenue.com/wp-content/uploads/2024/12/LaLom-040425-1080.jpg	368	2025-04-04 20:00:00	7	LA LOM	2024-12-22 21:17:06.199077	2024-12-22 21:17:06.199077	f
https://first-avenue.com/event/2025-04-tamino/	https://first-avenue.com/wp-content/uploads/2024/10/Tamino-040425-1080x1440-1.jpg	369	2025-04-04 20:00:00	50	Tamino, plus +.+	2024-12-22 21:17:06.573537	2024-12-22 21:17:06.573537	f
https://first-avenue.com/event/2025-04-the-hard-quartet/	https://first-avenue.com/wp-content/uploads/2024/10/TheHardQuartet-040525-1080.jpg	370	2025-04-05 20:00:00	8	The Hard Quartet, Sharp Pins	2024-12-22 21:17:07.014452	2024-12-22 21:17:07.014452	f
https://first-avenue.com/event/2025-04-anxious/	https://first-avenue.com/wp-content/uploads/2024/12/Anxious-040525-1080.jpg	371	2025-04-05 20:00:00	1	Anxious, Ultra Q, Stateside	2024-12-22 21:17:07.568439	2024-12-22 21:17:07.568439	f
https://first-avenue.com/event/2025-04-rebecca-black/	https://first-avenue.com/wp-content/uploads/2024/12/RebeccaBlack-040525-1080.jpg	372	2025-04-05 20:30:00	2	Rebecca Black, Blue Hawaii	2024-12-22 21:17:09.375658	2024-12-22 21:17:09.375658	f
https://first-avenue.com/event/event-2025-04-jack-white-mon/	https://first-avenue.com/wp-content/uploads/2024/11/JackWhite-Apr2025-1080.jpg	373	2025-04-07 19:30:00	24	JACK WHITE	2024-12-22 21:17:11.059286	2024-12-22 21:17:11.059286	f
https://first-avenue.com/event/2025-04-ani-difranco/	https://first-avenue.com/wp-content/uploads/2024/09/AniDifranco-040825-1080.jpg	374	2025-04-08 19:30:00	8	Ani DiFranco, Special Guests TBA	2024-12-22 21:17:11.453876	2024-12-22 21:17:11.453876	f
https://first-avenue.com/event/event-2025-04-jack-white-tue/	https://first-avenue.com/wp-content/uploads/2024/11/JackWhite-Apr2025-1080.jpg	375	2025-04-08 19:30:00	24	JACK WHITE	2024-12-22 21:17:12.557312	2024-12-22 21:17:12.557312	f
https://first-avenue.com/event/2025-04-sam-blasucci-and-julia-zivic/	https://first-avenue.com/wp-content/uploads/2024/12/SamBlasucci-JuliaZivic-040925-1080.jpg	376	2025-04-09 20:00:00	1	Sam Blasucci, Julia Zivic	2024-12-22 21:17:12.954391	2024-12-22 21:17:12.954391	f
https://first-avenue.com/event/2025-04-jazz-is-dead-feat-ebo-taylor-pat-thomas/	https://first-avenue.com/wp-content/uploads/2024/06/EboTaylorPatThomas-040925-1080.jpg	377	2025-04-09 20:00:00	7	Ebo Taylor, Pat Thomas	2024-12-22 21:17:14.604188	2024-12-22 21:17:14.604188	f
https://first-avenue.com/event/2025-04-alan-sparhawk-mount-eerie/	https://first-avenue.com/wp-content/uploads/2024/11/AlanSparhawkMountEerie-041025-1080.jpg	378	2025-04-10 19:00:00	8	Alan Sparhawk, Mount Eerie	2024-12-22 21:17:15.209199	2024-12-22 21:17:15.209199	f
https://first-avenue.com/event/2025-04-the-newest-olympian/	https://first-avenue.com/wp-content/uploads/2024/11/TheNewestOlympian-041025-1080.jpg	379	2025-04-10 20:00:00	46	The Newest Olympian	2024-12-22 21:17:16.421597	2024-12-22 21:17:16.421597	f
https://first-avenue.com/event/2025-04-canaan-cox/	https://first-avenue.com/wp-content/uploads/2024/10/CanaanCox-041125-1080x1407-1.jpg	380	2025-04-11 20:30:00	1	Canaan Cox	2024-12-22 21:17:16.902532	2024-12-22 21:17:16.902532	f
https://first-avenue.com/event/2025-04-the-weather-station/	https://first-avenue.com/wp-content/uploads/2024/11/TheWeatherStation-041125-1080.jpg	381	2025-04-11 20:30:00	46	The Weather Station	2024-12-22 21:17:18.416577	2024-12-22 21:17:18.416577	f
https://first-avenue.com/event/2025-04-the-linda-lindas/	https://first-avenue.com/wp-content/uploads/2024/10/TheLindaLindas-041225-1080.jpg	382	2025-04-12 19:30:00	7	The Linda Lindas, Pinkshift	2024-12-22 21:17:18.833964	2024-12-22 21:17:18.833964	f
https://first-avenue.com/event/2025-04-visions-of-atlantis/	https://first-avenue.com/wp-content/uploads/2024/10/VisionsofAtlanis-041225-1080x1669-1.jpg	383	2025-04-12 20:00:00	46	Visions of Atlantis	2024-12-22 21:17:19.283392	2024-12-22 21:17:19.283392	f
https://first-avenue.com/event/2025-04-ninja-sex-party/	https://first-avenue.com/wp-content/uploads/2024/10/NinjaSexParty-041225-1080v0.jpg	384	2025-04-12 20:00:00	8	Ninja Sex Party, TWRP	2024-12-22 21:17:20.373453	2024-12-22 21:17:20.373453	f
https://first-avenue.com/event/2025-04-wheatus/	https://first-avenue.com/wp-content/uploads/2024/11/Wheatus-041325-1080.jpg	385	2025-04-13 20:00:00	1	Wheatus	2024-12-22 21:17:20.777292	2024-12-22 21:17:20.777292	f
https://first-avenue.com/event/2025-04-shordie-shordie/	https://first-avenue.com/wp-content/uploads/2024/12/ShordieShordie-041325-1080x1669-1.jpg	386	2025-04-13 20:00:00	7	Shordie Shordie	2024-12-22 21:17:22.380066	2024-12-22 21:17:22.380066	f
https://first-avenue.com/event/2025-04-elderbrook/	https://first-avenue.com/wp-content/uploads/2024/11/Elderbrook-041725-1080.jpg	387	2025-04-17 20:00:00	8	Elderbrook, Jerro	2024-12-22 21:17:22.796884	2024-12-22 21:17:22.796884	f
https://first-avenue.com/event/2024-04-the-lagoons/	https://first-avenue.com/wp-content/uploads/2024/11/TheLagoons-041725-1080.jpg	388	2025-04-17 20:00:00	1	The Lagoons	2024-12-22 21:17:23.19101	2024-12-22 21:17:23.19101	f
https://first-avenue.com/event/2025-04-goldie-live/	https://first-avenue.com/wp-content/uploads/2024/12/Goldie-041725-1080.jpg	389	2025-04-17 21:00:00	7	Goldie, Submotive	2024-12-22 21:17:23.708887	2024-12-22 21:17:23.708887	f
https://link.dice.fm/E701e33ca88e?pid=1d4479ef	https://dice-media.imgix.net/attachments/2025-01-02/b908680c-d8d7-4b27-bd51-381da2b4a909.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	4953	2025-02-08 18:30:00	32	Careful Gaze, Friends	2025-01-07 09:50:30.192937	2025-01-07 09:50:30.192937	f
https://first-avenue.com/event/2025-04-tropidelic-and-ballyhoo/	https://first-avenue.com/wp-content/uploads/2024/12/TropidelicBallyhoo-041825-1080.jpg	391	2025-04-18 19:30:00	7	Tropidelic, Ballyhoo!, Joey Harkum	2024-12-22 21:17:25.570871	2024-12-22 21:17:25.570871	f
https://first-avenue.com/event/2025-04-mssv/	https://first-avenue.com/wp-content/uploads/2024/12/mssv-041825-1080x1669-1.jpg	392	2025-04-18 20:00:00	46	mssv	2024-12-22 21:17:26.144863	2024-12-22 21:17:26.144863	f
https://first-avenue.com/event/2025-04-brenn/	https://first-avenue.com/wp-content/uploads/2024/12/Brenn-041925-1080x1252-1.jpg	393	2025-04-19 19:30:00	7	BRENN!	2024-12-22 21:17:26.687116	2024-12-22 21:17:26.687116	f
https://first-avenue.com/event/2025-04-james-bay/	https://first-avenue.com/wp-content/uploads/2024/10/JamesBay-042125-1080.jpg	394	2025-04-21 19:00:00	8	James Bay	2024-12-22 21:17:27.095278	2024-12-22 21:17:27.095278	f
https://first-avenue.com/event/2025-04-boywithuke/	https://first-avenue.com/wp-content/uploads/2024/11/Boywithuke-042225-1080.jpg	395	2025-04-22 19:00:00	24	BoyWithUke, Ethan Bortnick	2024-12-22 21:17:27.642864	2024-12-22 21:17:27.642864	f
https://first-avenue.com/event/2025-04-john-splithoff/	https://first-avenue.com/wp-content/uploads/2024/12/JohnSplithoff-040225-1080.jpg	396	2025-04-22 20:00:00	2	John Splithoff	2024-12-22 21:17:28.10158	2024-12-22 21:17:28.10158	f
https://first-avenue.com/event/2025-04-dean-lewis/	https://first-avenue.com/wp-content/uploads/2024/06/DeanLewis-042324-1080.jpg	398	2025-04-23 19:30:00	24	Dean Lewis	2024-12-22 21:17:28.973136	2024-12-22 21:17:28.973136	f
https://first-avenue.com/event/2025-04-varietopia-with-paul-f-tompkins/	https://first-avenue.com/wp-content/uploads/2024/11/Varietourpia-042425-1080.jpg	399	2025-04-24 20:00:00	50	Varietopia, Paul F. Tompkins	2024-12-22 21:17:29.380677	2024-12-22 21:17:29.380677	f
https://first-avenue.com/event/2025-04-cryogeyser/	https://first-avenue.com/wp-content/uploads/2024/12/Cryogeyser-042425-1080x1669-1.jpg	400	2025-04-24 20:00:00	1	Cryogeyser	2024-12-22 21:17:31.843687	2024-12-22 21:17:31.843687	f
https://first-avenue.com/event/2024-04-ty-segall-solo/	https://first-avenue.com/wp-content/uploads/2024/07/TySegall-042525-1080v1.jpg	401	2025-04-25 20:00:00	38	Ty Segall, Mikal Cronin (Solo)	2024-12-22 21:17:32.703591	2024-12-22 21:17:32.703591	f
https://first-avenue.com/event/2025-04-don-quixote-sat/	https://first-avenue.com/wp-content/uploads/2024/08/DonQuixote-Ballet-Apr2025-1080.jpg	402	2025-04-26 19:30:00	50	Metropolitan Ballet presentsDon Quixote	2024-12-22 21:17:33.174184	2024-12-22 21:17:33.174184	f
https://first-avenue.com/event/2025-04-the-bright-light-social-hour/	https://first-avenue.com/wp-content/uploads/2024/11/TheBrightLightSocialHour-042625-1080.jpg	403	2025-04-26 20:00:00	1	The Bright Light Social Hour	2024-12-22 21:17:33.579645	2024-12-22 21:17:33.579645	f
https://first-avenue.com/event/2025-04-keller-williams/	https://first-avenue.com/wp-content/uploads/2024/12/KellerWilliams-042625-1080.jpg	404	2025-04-26 20:30:00	2	Keller Williams	2024-12-22 21:17:33.977577	2024-12-22 21:17:33.977577	f
https://first-avenue.com/event/2025-04-maribou-state/	https://first-avenue.com/wp-content/uploads/2024/10/MaribouState-042625-1080.jpg	405	2025-04-26 20:30:00	8	Maribou State	2024-12-22 21:17:35.179729	2024-12-22 21:17:35.179729	f
https://first-avenue.com/event/2025-04-don-quixote-sun/	https://first-avenue.com/wp-content/uploads/2024/08/DonQuixote-Ballet-Apr2025-1080.jpg	406	2025-04-27 14:00:00	50	Metropolitan Ballet presentsDon Quixote	2024-12-22 21:17:35.650157	2024-12-22 21:17:35.650157	f
https://first-avenue.com/event/2025-04-penny-and-sparrow/	https://first-avenue.com/wp-content/uploads/2024/10/PennySparrow-042725-1080v1.jpg	407	2025-04-27 20:00:00	8	Penny & Sparrow, Field Guide	2024-12-22 21:17:36.109975	2024-12-22 21:17:36.109975	f
https://first-avenue.com/event/2025-04-awolnation/	https://first-avenue.com/wp-content/uploads/2024/09/Awolnation-042825-1080x1643-1.jpg	408	2025-04-28 20:00:00	8	AWOLNATION, Bryce Fox	2024-12-22 21:17:36.635749	2024-12-22 21:17:36.635749	f
https://first-avenue.com/event/2025-04-ben-kweller/	https://first-avenue.com/wp-content/uploads/2024/12/BenKweller-042825-1080.jpg	409	2025-04-28 20:00:00	7	Ben Kweller	2024-12-22 21:17:38.085775	2024-12-22 21:17:38.085775	f
https://first-avenue.com/event/2025-04-matthew-and-the-atlas/	https://first-avenue.com/wp-content/uploads/2024/12/MatthewAndTheAtlas-042925-1080.jpg	410	2025-04-29 20:00:00	1	Matthew And The Atlas	2024-12-22 21:17:38.524222	2024-12-22 21:17:38.524222	f
https://first-avenue.com/event/2025-04-jesse-cook/	https://first-avenue.com/wp-content/uploads/2024/06/JesseCook-042925-1080.jpg	411	2025-04-29 20:15:00	50	Jesse Cook	2024-12-22 21:17:39.038674	2024-12-22 21:17:39.038674	f
https://first-avenue.com/event/2025-04-laura-jane-grace-the-mississippi-medicals/	https://first-avenue.com/wp-content/uploads/2024/11/LauraJaneGrace-043025-1080x1669-1.jpg	412	2025-04-30 20:00:00	2	Laura Jane Grace, Alex Lahey, Noun	2024-12-22 21:17:39.557311	2024-12-22 21:17:39.557311	f
https://first-avenue.com/event/2025-05-the-wrecks/	https://first-avenue.com/wp-content/uploads/2024/09/TheWrecks-050125-1080x1372-1.jpg	413	2025-05-01 18:30:00	8	The Wrecks	2024-12-22 21:17:43.630199	2024-12-22 21:17:43.630199	f
https://first-avenue.com/event/2025-05-lily-rose/	https://first-avenue.com/wp-content/uploads/2024/12/LilyRose-050125-1080.jpg	414	2025-05-01 20:00:00	7	Lily Rose, Payton Smith	2024-12-22 21:17:44.070574	2024-12-22 21:17:44.070574	f
https://first-avenue.com/event/2025-05-zzzahara/	https://first-avenue.com/wp-content/uploads/2024/12/zzzahara-050225-1080.jpg	415	2025-05-02 20:00:00	1	zzzahara	2024-12-22 21:17:44.605813	2024-12-22 21:17:44.605813	f
https://first-avenue.com/event/2025-05-papooz/	https://first-avenue.com/wp-content/uploads/2024/10/Papooz-050225-1080.jpg	416	2025-05-02 20:00:00	46	Papooz	2024-12-22 21:17:45.045569	2024-12-22 21:17:45.045569	f
https://first-avenue.com/event/2025-05-clap-your-hands-say-yeah/	https://first-avenue.com/wp-content/uploads/2024/11/ClapYourHandsSayYeah-050225-1080.jpg	417	2025-05-02 20:30:00	2	Clap Your Hands Say Yeah	2024-12-22 21:17:45.427457	2024-12-22 21:17:45.427457	f
https://first-avenue.com/event/2025-05-fox-stevenson/	https://first-avenue.com/wp-content/uploads/2024/11/FoxStevenson-050325-1080.jpg	418	2025-05-03 20:00:00	46	Fox Stevenson, Yue	2024-12-22 21:17:45.823285	2024-12-22 21:17:45.823285	f
https://first-avenue.com/event/2025-05-ichiko-aoba/	https://first-avenue.com/wp-content/uploads/2024/11/IchikoAoba-May2025-1080.jpg	419	2025-05-03 20:00:00	50	Ichiko Aoba	2024-12-22 21:17:47.033817	2024-12-22 21:17:47.033817	f
https://first-avenue.com/event/2025-05-reggie-watts-live/	https://first-avenue.com/wp-content/uploads/2024/10/ReggieWatts-050325-1080x1669-1.jpg	420	2025-05-03 20:30:00	7	Reggie Watts	2024-12-22 21:17:47.508644	2024-12-22 21:17:47.508644	f
https://first-avenue.com/event/2025-05-ichiko-aoba-sun/	https://first-avenue.com/wp-content/uploads/2024/11/IchikoAoba-May2025-1080.jpg	421	2025-05-04 20:00:00	50	Ichiko Aoba	2024-12-22 21:17:47.954966	2024-12-22 21:17:47.954966	f
https://first-avenue.com/event/2025-05-citizen-soldier/	https://first-avenue.com/wp-content/uploads/2024/11/CitizenSoldier-050525-1080.jpg	422	2025-05-05 19:00:00	8	Citizen Soldier, 10 Years, Thousand Below, Nerv	2024-12-22 21:17:49.022747	2024-12-22 21:17:49.022747	f
https://first-avenue.com/event/2025-05-shayfer-james/	https://first-avenue.com/wp-content/uploads/2024/12/ShayferJames-050525-1080.jpg	423	2025-05-05 19:30:00	1	Shayfer James, Sparkbird	2024-12-22 21:17:49.406709	2024-12-22 21:17:49.406709	f
https://first-avenue.com/event/2025-05-magic-sword/	https://first-avenue.com/wp-content/uploads/2024/12/MagicSword-050525-1080x1669-1.jpg	424	2025-05-05 20:00:00	46	Magic Sword, Starbenders, Mega Ran	2024-12-22 21:17:49.794303	2024-12-22 21:17:49.794303	f
https://first-avenue.com/event/2025-05-the-cavemen/	https://first-avenue.com/wp-content/uploads/2024/10/TheCavemen-050625-1080.jpg	425	2025-05-06 20:00:00	1	The Cavemen.	2024-12-22 21:17:50.246359	2024-12-22 21:17:50.246359	f
https://link.dice.fm/F0ef469b1fea?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/b4050cbf-a1ec-4cd4-8daa-6a056ac76e30.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	787	2025-02-16 19:00:00	32	Rickshaw Billie's Burger Patrol, Lip Critic	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://first-avenue.com/event/2025-05-allison-russell/	https://first-avenue.com/wp-content/uploads/2024/05/AllisonRussell-050925-1080.jpg	428	2025-05-09 19:30:00	8	Allison Russell, Kara Jackson	2024-12-22 21:17:52.106533	2024-12-22 21:17:52.106533	f
https://first-avenue.com/event/2025-05-the-magnetic-fields-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TheMagneticFields-May2025-1080x1209v0.jpg	429	2025-05-09 20:00:00	50	The Magnetic Fields	2024-12-22 21:17:53.522723	2024-12-22 21:17:53.522723	f
https://first-avenue.com/event/2025-05-alison-moyet/	https://first-avenue.com/wp-content/uploads/2024/10/AlisonMoyet-050925-1080x1538-1.jpg	430	2025-05-09 20:30:00	7	Alison Moyet	2024-12-22 21:17:53.936123	2024-12-22 21:17:53.936123	f
https://first-avenue.com/event/2025-05-sharon-van-etten/	https://first-avenue.com/wp-content/uploads/2024/12/SharonVanEtten-051025-1080.jpg	431	2025-05-10 19:30:00	24	Sharon Van Etten, Love Spells	2024-12-22 21:17:54.346676	2024-12-22 21:17:54.346676	f
https://first-avenue.com/event/2025-05-the-magnetic-fields-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TheMagneticFields-May2025-1080x1209v0.jpg	432	2025-05-10 20:00:00	50	The Magnetic Fields	2024-12-22 21:17:55.390036	2024-12-22 21:17:55.390036	f
https://first-avenue.com/event/2025-05-gang-of-four/	https://first-avenue.com/wp-content/uploads/2024/10/GangofFour-051025-1080x1669-1.jpg	433	2025-05-10 20:00:00	7	Gang of Four	2024-12-22 21:17:55.770156	2024-12-22 21:17:55.770156	f
https://first-avenue.com/event/2025-05-tommyinnit/	https://first-avenue.com/wp-content/uploads/2024/11/TommyInnit_051125-1080.jpg	434	2025-05-11 20:00:00	50	TommyInnit	2024-12-22 21:17:56.181319	2024-12-22 21:17:56.181319	f
https://first-avenue.com/event/2025-05-boa/	https://first-avenue.com/wp-content/uploads/2024/10/Boa-051325-1080x1509v0.jpg	435	2025-05-13 20:00:00	8	bôa	2024-12-22 21:17:56.595682	2024-12-22 21:17:56.595682	f
https://first-avenue.com/event/2025-05-saint-motel/	https://first-avenue.com/wp-content/uploads/2024/09/SaintMotel-051325-1080.jpg	436	2025-05-13 20:00:00	24	Saint Motel, Brigitte Calls Me Baby	2024-12-22 21:17:56.967387	2024-12-22 21:17:56.967387	f
https://first-avenue.com/event/2025-05-spellling/	https://first-avenue.com/wp-content/uploads/2024/10/Spellling-051425-1080.jpg	437	2025-05-14 20:00:00	7	SPELLLING	2024-12-22 21:17:57.576886	2024-12-22 21:17:57.576886	f
https://first-avenue.com/event/2025-05-kyle-gordon/	https://first-avenue.com/wp-content/uploads/2024/12/KyleGordon-051425-1080.jpg	438	2025-05-14 20:00:00	1	Kyle Gordon	2024-12-22 21:17:57.995059	2024-12-22 21:17:57.995059	f
https://first-avenue.com/event/2025-05-cheekface/	https://first-avenue.com/wp-content/uploads/2024/12/Cheekface-051525-1080.jpg	439	2025-05-15 20:00:00	7	Cheekface	2024-12-22 21:17:58.486706	2024-12-22 21:17:58.486706	f
https://first-avenue.com/event/2025-05-matthew-logan-vasquez/	https://first-avenue.com/wp-content/uploads/2024/10/MatthewLoganVasquez-051525-1080.jpg	440	2025-05-15 20:30:00	1	Matthew Logan Vasquez, Jacob Alan Jaeger	2024-12-22 21:17:58.874201	2024-12-22 21:17:58.874201	f
https://first-avenue.com/event/2025-05-larkin-poe/	https://first-avenue.com/wp-content/uploads/2024/10/LarkinPoe-051625-1080v0.jpg	441	2025-05-16 20:00:00	8	Larkin Poe, Amythyst Kiah	2024-12-22 21:17:59.335896	2024-12-22 21:17:59.335896	f
https://first-avenue.com/event/2025-05-the-devil-makes-three/	https://first-avenue.com/wp-content/uploads/2024/10/DevilMakesThree-051725-1080.jpg	442	2025-05-17 20:30:00	8	The Devil Makes Three, Bridge City Sinners	2024-12-22 21:18:00.625751	2024-12-22 21:18:00.625751	f
https://first-avenue.com/event/2025-05-napalm-death-and-melvins/	https://first-avenue.com/wp-content/uploads/2024/11/NapalmDeath-Melvins-052225-1080.jpg	443	2025-05-22 19:00:00	8	Napalm Death, Melvins, Hard-Ons (with Jerry A), Dark Sky Burial	2024-12-22 21:18:01.036143	2024-12-22 21:18:01.036143	f
https://first-avenue.com/event/2025-05-mike/	https://first-avenue.com/wp-content/uploads/2024/10/MIKE-052225-1080.jpg	444	2025-05-22 20:00:00	2	MIKE	2024-12-22 21:18:01.581902	2024-12-22 21:18:01.581902	f
https://first-avenue.com/event/2025-05-friko/	https://first-avenue.com/wp-content/uploads/2024/10/Friko-052225-1080.jpg	445	2025-05-22 20:30:00	7	Friko, youbet	2024-12-22 21:18:01.954553	2024-12-22 21:18:01.954553	f
https://first-avenue.com/event/2025-05-the-kiffness/	https://first-avenue.com/wp-content/uploads/2024/11/TheKiffness-052425-1080.jpg	446	2025-05-24 19:30:00	7	The Kiffness	2024-12-22 21:18:02.369266	2024-12-22 21:18:02.369266	f
https://first-avenue.com/event/2025-05-sesame-street-live/	https://first-avenue.com/wp-content/uploads/2024/10/SesameStreetLive-052925-1080.jpg	447	2025-05-29 18:00:00	50	Sesame Street Live — Say Hello	2024-12-22 21:18:02.78952	2024-12-22 21:18:02.78952	f
https://first-avenue.com/event/2025-05-hippo-campus/	https://first-avenue.com/wp-content/uploads/2024/09/HippoCampus-053125-1080.jpg	448	2025-05-31 19:00:00	43	Hippo Campus, Hotline TNT	2024-12-22 21:18:03.181864	2024-12-22 21:18:03.181864	f
https://first-avenue.com/event/2025-05-the-wedding-present/	https://first-avenue.com/wp-content/uploads/2024/11/TheWeddingPresent-053125-1080.jpg	449	2025-05-31 20:00:00	46	The Wedding Present, The Tubs	2024-12-22 21:18:03.59609	2024-12-22 21:18:03.59609	f
https://first-avenue.com/event/2025-05-jackie-venson/	https://first-avenue.com/wp-content/uploads/2024/12/JackieVenson-053125-1080.jpg	450	2025-05-31 20:30:00	1	Jackie Venson	2024-12-22 21:18:03.970158	2024-12-22 21:18:03.970158	f
https://first-avenue.com/event/2025-06-sessanta-v2-0/	https://first-avenue.com/wp-content/uploads/2024/09/Sessanta-060125-1080.jpg	451	2025-06-01 19:30:00	49	SESSANTA, Primus, Puscifer, A Perfect Circle	2024-12-22 21:18:06.25512	2024-12-22 21:18:06.25512	f
https://first-avenue.com/event/2025-06-honey-revenge/	https://first-avenue.com/wp-content/uploads/2024/12/HoneyRevenge-060625-1080.jpg	452	2025-06-06 19:00:00	7	Honey Revenge, Daisy Grenade, Vana, Nightlife	2024-12-22 21:18:06.71354	2024-12-22 21:18:06.71354	f
https://first-avenue.com/event/2025-06-jeremy-piven-live/	https://first-avenue.com/wp-content/uploads/2024/11/JeremyPiven-060725-1080v1.jpg	453	2025-06-07 19:30:00	50	Jeremy Piven	2024-12-22 21:18:08.289339	2024-12-22 21:18:08.289339	f
https://first-avenue.com/event/2025-06-panchiko/	https://first-avenue.com/wp-content/uploads/2024/12/Panchiko-060725-1080.jpg	454	2025-06-07 19:30:00	8	Panchiko, Alison’s Halo	2024-12-22 21:18:08.745677	2024-12-22 21:18:08.745677	f
https://first-avenue.com/event/2025-06-ashe/	https://first-avenue.com/wp-content/uploads/2024/10/Ashe-061125-1080x1576v1.jpg	455	2025-06-11 19:30:00	8	Ashe, Bo Staloch	2024-12-22 21:18:09.197094	2024-12-22 21:18:09.197094	f
https://first-avenue.com/event/2025-06-samantha-crain/	https://first-avenue.com/wp-content/uploads/2024/11/SamanthaCrain-061525-1080.jpg	456	2025-06-15 20:00:00	1	Samantha Crain	2024-12-22 21:18:09.667283	2024-12-22 21:18:09.667283	f
https://first-avenue.com/event/2025-06-old-gods-of-appalachia/	https://first-avenue.com/wp-content/uploads/2024/04/OldGodsAppalachia-061825-1080.jpg	457	2025-06-18 20:00:00	50	Old Gods of Appalachia	2024-12-22 21:18:10.214697	2024-12-22 21:18:10.214697	f
https://first-avenue.com/event/2025-06-ben-rector/	https://first-avenue.com/wp-content/uploads/2024/11/BenRector-062025-1080.jpg	458	2025-06-20 19:00:00	24	Ben Rector, The National Parks	2024-12-22 21:18:10.6755	2024-12-22 21:18:10.6755	f
https://first-avenue.com/event/2025-06-the-cat-empire/	https://first-avenue.com/wp-content/uploads/2024/12/TheCatEmpire-062425-1080.jpg	459	2025-06-24 20:00:00	7	The Cat Empire	2024-12-22 21:18:11.098242	2024-12-22 21:18:11.098242	f
https://first-avenue.com/event/2025-06-omd/	https://first-avenue.com/wp-content/uploads/2024/04/OMD-062625-1080x1669-1.jpg	460	2025-06-26 20:30:00	8	OMD, Walt Disco	2024-12-22 21:18:11.478051	2024-12-22 21:18:11.478051	f
https://first-avenue.com/event/2025-05-amyl-and-the-sniffers/	https://first-avenue.com/wp-content/uploads/2024/10/AmylAndTheSniffers-050725-1080.jpg	427	2025-05-07 19:00:00	24	Amyl and The Sniffers, Sheer Mag	2024-12-22 21:17:51.68914	2024-12-22 21:17:51.68914	f
https://link.dice.fm/Se08d418ca59?pid=1d4479ef	https://dice-media.imgix.net/attachments/2025-01-02/8b2bdfe3-b113-4295-918e-cd44759bc26e.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	4955	2025-02-22 18:00:00	32	Plague of Stars CD Release Party	2025-01-07 09:50:30.192937	2025-01-07 09:50:30.192937	f
https://first-avenue.com/event/2025-07-mekons/	https://first-avenue.com/wp-content/uploads/2024/11/mekons-070925-1080.jpg	462	2025-07-09 20:00:00	7	mekons, Jake La Botz	2024-12-22 21:18:14.765047	2024-12-22 21:18:14.765047	f
https://www.greenroommn.com#/events/124602	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_e981758f4e24fe8a9c99c9ff88bda5ef0e1e974bc092d5145d8941bd8b079488.png	465	2024-12-22 16:00:00	22	"Playing House" Day Party, Deep House, Funky House Music - Queer Centered Makers Fair	2024-12-22 21:18:23.256635	2024-12-22 21:18:23.256635	f
https://www.greenroommn.com#/events/124277	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_9e27f8b0aa3325825a7e00adb4aa9edd3b38e35fa05747c0f6ebcc75af2627b5.png	466	2024-12-22 22:00:00	22	Synastry Sundays - A late night dance party, techno/house	2024-12-22 21:18:23.264033	2024-12-22 21:18:23.264033	f
https://www.greenroommn.com#/events/101629	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_45711aaeba0d29954e50a0b0a323500533a300739493e349917d96e5cbd6d274.png	467	2024-12-26 19:00:00	22	SNAPPED Live Band Open Mic	2024-12-22 21:18:23.264985	2024-12-22 21:18:23.264985	f
https://www.greenroommn.com#/events/119547	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_b660381ca4119b4f2fd9cbb320c6d675dd50a8a29d81110a6908fe83940a4a97.jpg	468	2024-12-27 19:00:00	22	Aiden Intro w/ Special Guests Ryan Kemp x Anna Devine	2024-12-22 21:18:23.265976	2024-12-22 21:18:23.265976	f
https://www.greenroommn.com#/events/124291	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_336ab954df53e2caaef079510e3f32039348a1150244a35ab35bba3938324366.jpg	469	2024-12-28 20:00:00	22	Abdu Kiar Feat. Nigusu Tamirat	2024-12-22 21:18:23.266621	2024-12-22 21:18:23.266621	f
https://www.greenroommn.com#/events/124278	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_47834429dbb50d0dfd7eeb4318a817e132d8a6f93eaecee14eec6aa433ce3f2d.png	470	2024-12-29 22:00:00	22	Synastry Sundays - A late night dance party, techno/house	2024-12-22 21:18:23.267316	2024-12-22 21:18:23.267316	f
https://link.dice.fm/ca4aab25091d?pid=1d4479ef	https://dice-media.imgix.net/attachments/2025-01-02/87e809d2-6452-442e-b207-c8638488964a.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	4956	2025-02-28 18:30:00	32	ORISKA, Silva, Dragged Out to Sea, Eudaemon	2025-01-07 09:50:30.192937	2025-01-07 09:50:30.192937	f
https://whitesquirrelbar.com/event/lucinda-williams-tribute-night/	https://whitesquirrelbar.com/wp-content/uploads/westseventh-lucinda-dec29.png	481	2024-12-29 20:00:00	48	Lucinda Williams Tribute Night	2024-12-22 21:18:24.386744	2024-12-22 21:18:24.386744	f
https://whitesquirrelbar.com/event/clash-city-rockers-w-tba/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	482	2024-12-23 21:00:00	48	Clash City Rockers, Tba	2024-12-22 21:18:24.418421	2024-12-22 21:18:24.418421	f
https://whitesquirrelbar.com/event/the-weeping-covenant-w-tba/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	483	2024-12-28 21:00:00	48	The Weeping Covenant, Tba	2024-12-22 21:18:24.41928	2024-12-22 21:18:24.41928	f
https://whitesquirrelbar.com/event/the-mary-cutrufello-band-6/	https://whitesquirrelbar.com/wp-content/uploads/marycutrufellonewpic.jpg	484	2024-12-25 18:00:00	48	The Mary Cutrufello Band	2024-12-22 21:18:24.420028	2024-12-22 21:18:24.420028	f
https://whitesquirrelbar.com/event/big-trouble-4/	https://whitesquirrelbar.com/wp-content/uploads/CC369DF7-964C-4A1B-B8E9-8C3850D404B1.JPG.jpeg	489	2024-12-28 18:00:00	48	120 Minutes	2024-12-22 21:18:24.42273	2024-12-22 21:18:24.42273	f
https://whitesquirrelbar.com/event/greg-volker-the-river-w-heidi-holton-izzy-cruz-band/	https://whitesquirrelbar.com/wp-content/uploads/Greg-Volker-and-The-River-a-Minnesota-Band-copy-smaller.png	490	2024-12-22 20:00:00	48	Greg Volker & the River, Heidi Holton, Izzy Cruz Band	2024-12-22 21:18:24.423281	2024-12-22 21:18:24.423281	f
https://first-avenue.com/event/2025-08-pixies/	https://first-avenue.com/wp-content/uploads/2024/10/Pixies-2025-1080x1297-1.jpg	464	2025-08-01 20:00:00	24	Pixies, Kurt Vile and The Violators	2024-12-22 21:18:17.213743	2024-12-22 21:18:17.213743	f
https://www.greenroommn.com#/events/123735	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_97f9b61b6c102c2710a2b6f92c02aa7cda0251ef570bf120c445f872a58c4b94.jpg	472	2025-01-08 19:30:00	22	Thomas Abban Residency Featuring Maya Marchelle	2024-12-22 21:18:23.268761	2024-12-22 21:18:23.268761	f
https://www.greenroommn.com#/events/114761	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_32ffcbf059ec4b26791edc42fa01afe7944326082d1cbcbc471972a92fa0599d.png	471	2024-12-31 21:00:00	22	NEW YEARS EVE w/ DJ Hampster Dance + Live Band Karaoke, Live Band Karaoke from A little Too Short to be Stormtroopers	2024-12-22 21:18:23.268092	2024-12-22 21:18:23.268092	f
https://www.greenroommn.com#/events/123736	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_97f9b61b6c102c2710a2b6f92c02aa7cda0251ef570bf120c445f872a58c4b94.jpg	473	2025-01-15 19:30:00	22	Thomas Abban Residency Featuring Lighter Co	2024-12-22 21:18:23.269234	2024-12-22 21:18:23.269234	f
https://www.greenroommn.com#/events/123737	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_97f9b61b6c102c2710a2b6f92c02aa7cda0251ef570bf120c445f872a58c4b94.jpg	474	2025-01-22 19:30:00	22	Thomas Abban Residency	2024-12-22 21:18:23.269769	2024-12-22 21:18:23.269769	f
https://www.greenroommn.com#/events/123738	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_97f9b61b6c102c2710a2b6f92c02aa7cda0251ef570bf120c445f872a58c4b94.jpg	475	2025-01-29 19:30:00	22	Thomas Abban Residency Feat Lady Midnight	2024-12-22 21:18:23.270499	2024-12-22 21:18:23.270499	f
https://www.greenroommn.com#/events/120394	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a799ac06297b62850a13d388f6bd43984a29c3e536a9d18f25fa497a200802a9.png	477	2025-02-01 18:00:00	22	2 Year Anniversary NIGHT 2 - Marijuana Deathsquads, Why Not, Reiki, Ava Levy, Marijuana Deathsquads, Why Not, Reiki, Ava Levy	2024-12-22 21:18:23.272422	2024-12-22 21:18:23.272422	f
https://www.greenroommn.com#/events/124302	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_036b4b27e4457b4be5fff09e49dedd7d2b551efebcf226961a313314f23d2a4a.jpg	478	2025-02-02 16:00:00	22	Sunday FUND Day - An LGBTQ+ Fundraising Event, LINEUP TBA	2024-12-22 21:18:23.273115	2024-12-22 21:18:23.273115	f
https://www.greenroommn.com#/events/125629	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_6a13b19bc96c091f5d445a8ff657086f909f930504091e14dc44186289b6c05b.jpg	479	2025-02-15 19:00:00	22	Good Morning Bedlam, w/ People Brothers Band	2024-12-22 21:18:23.273775	2024-12-22 21:18:23.273775	f
https://www.greenroommn.com#/events/122235	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_16f2b713e3fb2e5f65fd24949899a635363d03f2988d26fbc59c584e9cf263b6.jpg	480	2025-05-02 18:00:00	22	ROLLING QUARTZ - Stand Up Tour in Minneapolis	2024-12-22 21:18:23.27444	2024-12-22 21:18:23.27444	f
https://whitesquirrelbar.com/event/noah-schmitt/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	485	2025-01-02 18:00:00	48	Noah Schmitt	2024-12-22 21:18:24.420701	2024-12-22 21:18:24.420701	f
https://whitesquirrelbar.com/event/linnea-grace-w-deer-skin-casey-gerald/	https://whitesquirrelbar.com/wp-content/uploads/IMG_6734-scaled.jpeg	486	2025-01-04 13:00:00	48	Linnea Grace w.Deer Skin, Casey Gerald	2024-12-22 21:18:24.421324	2024-12-22 21:18:24.421324	f
https://whitesquirrelbar.com/event/tba/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	487	2025-01-01 21:00:00	48	Devil Dodger	2024-12-22 21:18:24.421796	2024-12-22 21:18:24.421796	f
https://whitesquirrelbar.com/event/the-second-stringers-w-special-guests-4/	https://whitesquirrelbar.com/wp-content/uploads/the2ndstringersnewposter.jpg	488	2025-01-01 18:00:00	48	The Second Stringers, Special Guests	2024-12-22 21:18:24.422269	2024-12-22 21:18:24.422269	f
https://link.dice.fm/ld2dcd108445?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-31/e2ee23b7-7a97-40ea-8261-7a92d88cb4fd.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	4952	2025-01-10 19:00:00	32	cole diamond, Cain & Co., whiskey burn	2025-01-07 09:50:30.192937	2025-01-07 09:50:30.192937	f
https://whitesquirrelbar.com/event/dangerbad-w-paper-beast/	https://whitesquirrelbar.com/wp-content/uploads/IMG_20241126_125141.jpg	500	2024-12-27 21:00:00	48	Dangerbad, Paper Beast, Grudd Wallace	2024-12-22 21:18:24.467032	2024-12-22 21:18:24.467032	f
https://whitesquirrelbar.com/event/phantom-fields-w-special-guests/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	501	2024-12-26 21:00:00	48	Phantom Fields, Special guests	2024-12-22 21:18:24.467684	2024-12-22 21:18:24.467684	f
https://whitesquirrelbar.com/event/aaron-james-w-scott-hefte/	https://whitesquirrelbar.com/wp-content/uploads/DEC-29-Poster-WS-1.jpg	502	2024-12-29 13:00:00	48	Aaron James, Bury 'Em Deep, Wolf Baby Cup	2024-12-22 21:18:24.468157	2024-12-22 21:18:24.468157	f
https://whitesquirrelbar.com/event/billy-johnson/	https://whitesquirrelbar.com/wp-content/uploads/image0-2-3.jpeg	506	2024-12-26 18:00:00	48	Billy Johnson	2024-12-22 21:18:24.470234	2024-12-22 21:18:24.470234	f
https://whitesquirrelbar.com/event/closed-for-christmas-eve/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	507	2024-12-24 08:00:00	48	Closed for Christmas Eve	2024-12-22 21:18:24.470882	2024-12-22 21:18:24.470882	f
https://whitesquirrelbar.com/event/mark-ross-the-three-ninteens/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	508	2024-12-28 13:00:00	48	Mark Ross & The Three-Nineteens	2024-12-22 21:18:24.471754	2024-12-22 21:18:24.471754	f
https://www.facebook.com/profile.php?id=100094683949311&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	512	2024-12-23 18:00:00	9	HonkyTonk Ranch	2024-12-22 21:18:27.473886	2024-12-22 21:18:27.473886	f
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	513	2024-12-23 20:00:00	9	Roe Family Singers	2024-12-22 21:18:27.474338	2024-12-22 21:18:27.474338	f
https://www.facebook.com/mikemunson?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	514	2024-12-26 21:30:00	9	mike munson	2024-12-22 21:18:27.474938	2024-12-22 21:18:27.474938	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	515	2024-12-27 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.475364	2024-12-22 21:18:27.475364	f
https://www.facebook.com/bethanylarsonandthebeesknees?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	516	2024-12-27 22:00:00	9	Bethany Larson the Bee’s Knees, Boots & Needles, Secret Special Guest	2024-12-22 21:18:27.475983	2024-12-22 21:18:27.475983	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	517	2024-12-28 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.476831	2024-12-22 21:18:27.476831	f
https://www.facebook.com/nightauditband?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	518	2024-12-28 22:00:00	9	Night Audit, North Innsbruck, wolfbabycup	2024-12-22 21:18:27.477477	2024-12-22 21:18:27.477477	f
https://www.facebook.com/beckykapellmusic?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	519	2024-12-29 19:00:00	9	Becky Kapell The Fat 6	2024-12-22 21:18:27.478178	2024-12-22 21:18:27.478178	f
https://whitesquirrelbar.com/event/bruce-bednarchuck/	https://whitesquirrelbar.com/wp-content/uploads/image0-2-1.png	498	2024-12-27 18:00:00	48	bruce bednarchuck, test	2024-12-22 21:18:24.465408	2024-12-22 21:18:24.465408	f
https://whitesquirrelbar.com/event/david-berman-tribute/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	504	2025-01-04 21:00:00	48	David Berman Tribute	2024-12-22 21:18:24.46916	2024-12-22 21:18:24.46916	f
https://whitesquirrelbar.com/event/the-over-unders-w-pullstring-the-symptones/	https://whitesquirrelbar.com/wp-content/uploads/Flyer-1325.png	491	2025-01-03 21:00:00	48	Pullstring, The Over Unders, The Symptones	2024-12-22 21:18:24.423651	2024-12-22 21:18:24.423651	f
https://whitesquirrelbar.com/event/andrew-kneeland-w-tba/	https://whitesquirrelbar.com/wp-content/uploads/show-poster-1-1.jpg	493	2024-12-30 21:00:00	48	Andrew Kneeland, Little Fevers, Sun Patches	2024-12-22 21:18:24.461366	2024-12-22 21:18:24.461366	f
https://whitesquirrelbar.com/event/night-heat/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	495	2025-01-05 20:00:00	48	Night Heat	2024-12-22 21:18:24.463926	2024-12-22 21:18:24.463926	f
https://whitesquirrelbar.com/event/uncle-dans-string-band/	https://whitesquirrelbar.com/wp-content/uploads/Screenshot-2024-11-21-at-11.38.22 AM.png	496	2025-01-06 18:00:00	48	Uncle Dan's String Band	2024-12-22 21:18:24.464475	2024-12-22 21:18:24.464475	f
https://whitesquirrelbar.com/event/yeah-yeah-fine/	https://whitesquirrelbar.com/wp-content/uploads/IMG_9326.jpeg	497	2025-01-05 13:00:00	48	Yeah Yeah Fine	2024-12-22 21:18:24.464863	2024-12-22 21:18:24.464863	f
https://whitesquirrelbar.com/event/chief-opossum-w-sammie-jean-cohen-samuel-john/	https://whitesquirrelbar.com/wp-content/uploads/IMG_20241118_142950_792.jpg	499	2024-12-31 21:00:00	48	Chief Opossum, Sammie Jean Cohen, Samuel John	2024-12-22 21:18:24.466262	2024-12-22 21:18:24.466262	f
https://whitesquirrelbar.com/event/the-new-havoline-supremes-9/	https://whitesquirrelbar.com/wp-content/uploads/NewHavolineSupremeslogo.jpg	503	2024-12-31 18:00:00	48	The New Havoline Supremes	2024-12-22 21:18:24.468689	2024-12-22 21:18:24.468689	f
https://whitesquirrelbar.com/event/eleanor-d-w-the-ems/	https://whitesquirrelbar.com/wp-content/uploads/Snapchat-798681966.jpg	505	2025-01-04 18:00:00	48	Eleanor :D, The Em's	2024-12-22 21:18:24.469626	2024-12-22 21:18:24.469626	f
https://whitesquirrelbar.com/event/thomas-sticha/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	510	2025-01-02 21:00:00	48	Thomas Sticha	2024-12-22 21:18:24.472585	2024-12-22 21:18:24.472585	f
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	520	2024-12-30 20:00:00	9	Roe Family Singers	2024-12-22 21:18:27.478634	2024-12-22 21:18:27.478634	f
https://www.facebook.com/eldrifteofficial?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	521	2024-12-31 21:30:00	9	December Conspiracy Series featuring, El Drifte, Leslie Rich the Rocket Soul Choir, The Infernos	2024-12-22 21:18:27.479254	2024-12-22 21:18:27.479254	f
https://www.facebook.com/share/15DT3eiLE2/?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	522	2025-01-01 21:30:00	9	Lonesome Dan Kase	2024-12-22 21:18:27.479931	2024-12-22 21:18:27.479931	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	523	2025-01-01 19:00:00	9	Harold’s House Party on KFAI, The Eddies	2024-12-22 21:18:27.480387	2024-12-22 21:18:27.480387	f
https://whitesquirrelbar.com/event/the-whiskey-chase-w-friendzy-the-harmon-brothers-the-destroyer-of-fate/	https://whitesquirrelbar.com/wp-content/uploads/image0-3-2.jpeg	509	2025-01-03 18:00:00	48	the whiskey chase, friendzy, the harmon brothers, the destroyer of fate	2024-12-22 21:18:24.472195	2024-12-22 21:18:24.472195	f
https://www.facebook.com/profile.php?id=61557848086888&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	511	2024-12-22 19:00:00	9	The Real Chuck NORAD	2024-12-22 21:18:27.469341	2024-12-22 21:18:27.469341	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	544	2025-01-15 19:00:00	9	Harold’s House Party on KFAI, Tom Pevear	2024-12-22 21:18:27.491034	2024-12-22 21:18:27.491034	f
https://www.instagram.com/knifeemojiband?igsh=eDRteWM2aGx4Zmx5	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	545	2025-01-16 21:30:00	9	Cross Pollination, Knife Emoji, Plumbstar	2024-12-22 21:18:27.491507	2024-12-22 21:18:27.491507	f
https://www.instagram.com/poolboytheband?igsh=NDNranJhYW54cDQ4	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	546	2025-01-17 22:00:00	9	Poolboy, Beemer, Seven Pines	2024-12-22 21:18:27.491974	2024-12-22 21:18:27.491974	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	547	2025-01-17 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.492355	2024-12-22 21:18:27.492355	f
https://www.instagram.com/redeyerubymusic?igsh=bzY0Nm55aXRyYWh5	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	548	2025-01-18 22:00:00	9	Red Eye Ruby	2024-12-22 21:18:27.492768	2024-12-22 21:18:27.492768	f
https://www.instagram.com/switchyard.band.mpls?igsh=eTJ6OTk2eXVubHZt	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	551	2025-01-19 19:00:00	9	Switchyard	2024-12-22 21:18:27.494096	2024-12-22 21:18:27.494096	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	550	2025-01-19 22:30:00	9	eleven degenerates	2024-12-22 21:18:27.493658	2024-12-22 21:18:27.493658	f
https://m.facebook.com/ruemates/	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	552	2025-01-20 20:00:00	9	Nikki & the Ruemates	2024-12-22 21:18:27.494546	2024-12-22 21:18:27.494546	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	526	2025-01-03 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.482104	2024-12-22 21:18:27.482104	f
https://www.facebook.com/emilyhaavikmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	553	2025-01-20 18:00:00	9	“Womenfolk Presents”, Emily Haavik	2024-12-22 21:18:27.49493	2024-12-22 21:18:27.49493	f
https://www.instagram.com/dot.operator.music?igsh=MTlpYWVkZWt0ank5dw==	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	531	2025-01-07 21:30:00	9	January Conspiracy Series featuring, Dot Operator, the Envies	2024-12-22 21:18:27.483919	2024-12-22 21:18:27.483919	f
https://www.berlinmpls.com/calendar/0m0p43qfrfrj5i6ku75cef81u4omo1-cylbs-xng8n-je9ez-3y5gx	\N	3836	2025-01-23 16:00:00	12	Private Event	2025-01-04 16:49:03.203539	2025-01-04 16:49:03.203539	f
https://www.instagram.com/the_cameras_music?igsh=cXl5MHk0eHFpbTl1	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	527	2025-01-04 22:00:00	9	The Cameras, Anything Your Want, Tarias The Sound	2024-12-22 21:18:27.482525	2024-12-22 21:18:27.482525	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	528	2025-01-04 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.482876	2024-12-22 21:18:27.482876	f
https://www.facebook.com/profile.php?id=100063684781557&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	529	2025-01-05 19:00:00	9	Brass Messengers	2024-12-22 21:18:27.48322	2024-12-22 21:18:27.48322	f
https://www.facebook.com/woodzenmn?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	530	2025-01-06 20:00:00	9	Woodzen	2024-12-22 21:18:27.483578	2024-12-22 21:18:27.483578	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	533	2025-01-08 19:00:00	9	Harold’s House Party on KFAI, The New Havoline Supremes	2024-12-22 21:18:27.485025	2024-12-22 21:18:27.485025	f
https://www.facebook.com/share/184U49GZuE/?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	532	2025-01-08 21:30:00	9	Potential New Boyfriend	2024-12-22 21:18:27.484523	2024-12-22 21:18:27.484523	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	536	2025-01-10 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.486743	2024-12-22 21:18:27.486743	f
https://andrewkneeland.bandcamp.com	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	534	2025-01-09 21:30:00	9	Andrew Kneeland, &, Marti Moreno, Sun Patches	2024-12-22 21:18:27.485637	2024-12-22 21:18:27.485637	f
https://www.instagram.com/speedridersband?igsh=NXBwY2xiZ3Rmc3hh	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	535	2025-01-10 22:00:00	9	Speed Riders, Sparrowhawk, Sick Eagle	2024-12-22 21:18:27.486226	2024-12-22 21:18:27.486226	f
https://www.facebook.com/profile.php?id=100063653763990&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	537	2025-01-11 22:00:00	9	Rank Strangers, The Bury ‘Em Deep, Superfloor	2024-12-22 21:18:27.487311	2024-12-22 21:18:27.487311	f
https://www.facebook.com/triplefiddle?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	555	2025-01-22 21:30:00	9	Triple Fiddle	2024-12-22 21:18:27.495722	2024-12-22 21:18:27.495722	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	538	2025-01-11 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.4877	2024-12-22 21:18:27.4877	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	539	2025-01-11 15:00:00	9	Voltage Controller	2024-12-22 21:18:27.488144	2024-12-22 21:18:27.488144	f
https://www.facebook.com/share/15UZypKYMV/?mibextid=wwXIfr	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	541	2025-01-13 20:00:00	9	the Robinson Roundup	2024-12-22 21:18:27.48968	2024-12-22 21:18:27.48968	f
https://www.facebook.com/profile.php?id=100090071273380&mibextid=7cd5pb	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	540	2025-01-12 19:00:00	9	Emmy Woods & The Red Pine Ramblers, Slapdash Bluegrass Band	2024-12-22 21:18:27.489205	2024-12-22 21:18:27.489205	f
https://www.instagram.com/hyoomanmusic?igsh=MXJoZnNiam0zMGc2OA==	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	542	2025-01-14 21:30:00	9	January Conspiracy Series featuring, Hyooman, despondent	2024-12-22 21:18:27.49013	2024-12-22 21:18:27.49013	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	543	2025-01-15 21:30:00	9	Lightbirds	2024-12-22 21:18:27.490591	2024-12-22 21:18:27.490591	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	549	2025-01-18 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.493235	2024-12-22 21:18:27.493235	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	576	2025-02-06 21:30:00	9	NORTHEAST INVITATIONAL	2024-12-22 21:18:27.504828	2024-12-22 21:18:27.504828	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	578	2025-02-07 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.505467	2024-12-22 21:18:27.505467	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	583	2025-02-10 18:00:00	9	Träctorheäd	2024-12-22 21:18:27.507143	2024-12-22 21:18:27.507143	f
https://www.instagram.com/raygunyouthband?igsh=djZwcjE3YTBjY2dv	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	579	2025-02-08 22:00:00	9	Ray Gun Youth, Strange Frequency, Time Room	2024-12-22 21:18:27.505828	2024-12-22 21:18:27.505828	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	580	2025-02-08 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.506089	2024-12-22 21:18:27.506089	f
https://www.facebook.com/profile.php?id=100090071273380&mibextid=7cd5pb	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	581	2025-02-09 19:00:00	9	Emmy Woods & The Red Pine Ramblers	2024-12-22 21:18:27.506452	2024-12-22 21:18:27.506452	f
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	582	2025-02-10 20:00:00	9	Roe Family Singers	2024-12-22 21:18:27.506777	2024-12-22 21:18:27.506777	f
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	584	2025-02-11 21:30:00	9	February Conspiracy Series featuring, Elour	2024-12-22 21:18:27.507539	2024-12-22 21:18:27.507539	f
https://www.facebook.com/share/19oGpyxwN6/?mibextid=wwXIfr	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	585	2025-02-12 21:30:00	9	The What-have-yous, Matt Caflisch	2024-12-22 21:18:27.507887	2024-12-22 21:18:27.507887	f
https://www.instagram.com/thehavanasleeve?igsh=OXNhdjBkazk3cnZ2	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	560	2025-01-25 22:00:00	9	The Havana Sleeve, Warcake, Loonbooster	2024-12-22 21:18:27.498457	2024-12-22 21:18:27.498457	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	586	2025-02-12 19:00:00	9	Harold’s House Party on KFAI, Scottie Miller	2024-12-22 21:18:27.508173	2024-12-22 21:18:27.508173	f
http://www.lenaelizabeth.com	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	557	2025-01-23 21:30:00	9	Lena Elizabeth, Maybe Nebraska	2024-12-22 21:18:27.496787	2024-12-22 21:18:27.496787	f
https://www.facebook.com/matthewthomaswoundedwing?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	558	2025-01-24 22:00:00	9	Matthew Thomas & Wounded Wing, Embahn	2024-12-22 21:18:27.49716	2024-12-22 21:18:27.49716	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	559	2025-01-24 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.497469	2024-12-22 21:18:27.497469	f
https://www.facebook.com/profile.php?id=61557848086888&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	562	2025-01-26 19:00:00	9	The Real Chuck NORAD	2024-12-22 21:18:27.499315	2024-12-22 21:18:27.499315	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	561	2025-01-25 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.498842	2024-12-22 21:18:27.498842	f
https://www.facebook.com/profile.php?id=100094683949311&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	564	2025-01-27 18:00:00	9	HonkyTonk Ranch	2024-12-22 21:18:27.500173	2024-12-22 21:18:27.500173	f
https://www.facebook.com/saidinstoneband?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	563	2025-01-27 20:00:00	9	Said in Stone	2024-12-22 21:18:27.499763	2024-12-22 21:18:27.499763	f
https://www.instagram.com/hyoomanmusic?igsh=MXJoZnNiam0zMGc2OA==	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	565	2025-01-28 21:30:00	9	January Conspiracy Series featuring, Hyooman, Curve	2024-12-22 21:18:27.500546	2024-12-22 21:18:27.500546	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	570	2025-01-31 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.502616	2024-12-22 21:18:27.502616	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	567	2025-01-29 19:00:00	9	Harold’s House Party on KFAI, The Five Dans	2024-12-22 21:18:27.501231	2024-12-22 21:18:27.501231	f
https://www.facebook.com/share/1FR7mQb7DY/?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	568	2025-01-30 21:30:00	9	The Record Club, Powersock	2024-12-22 21:18:27.501555	2024-12-22 21:18:27.501555	f
https://www.instagram.com/fauxpseudobandmn?igsh=bmpkdjhuc244M3I2	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	569	2025-01-31 22:00:00	9	Faux Pseudo, Sleepy Eye, Paul Cerar	2024-12-22 21:18:27.501882	2024-12-22 21:18:27.501882	f
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	573	2025-02-04 21:30:00	9	February Conspiracy Series featuring, Elour	2024-12-22 21:18:27.503786	2024-12-22 21:18:27.503786	f
https://www.facebook.com/profile.php?id=100063684781557&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	571	2025-02-02 19:00:00	9	Brass Messengers	2024-12-22 21:18:27.502999	2024-12-22 21:18:27.502999	f
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	572	2025-02-03 20:00:00	9	Roe Family Singers	2024-12-22 21:18:27.503369	2024-12-22 21:18:27.503369	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	575	2025-02-05 19:00:00	9	Harold’s House Party on KFAI, Kismet Rendezvous	2024-12-22 21:18:27.504479	2024-12-22 21:18:27.504479	f
https://www.facebook.com/bossopoetrycompany?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	574	2025-02-05 21:30:00	9	Bosso Poetry Company	2024-12-22 21:18:27.504138	2024-12-22 21:18:27.504138	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	577	2025-02-07 22:00:00	9	The Hobbled	2024-12-22 21:18:27.505182	2024-12-22 21:18:27.505182	f
https://icehouse.turntabletickets.com/r/kiss-the-tiger-december-residency	https://assets-prod.turntabletickets.com/media/icehouse/show-4768/KTT_December_11x17TT.png.jpg	613	2024-12-26 19:00:00	34	Kiss the Tiger December Residency	2024-12-22 21:18:28.346859	2024-12-22 21:18:28.346859	f
https://icehouse.turntabletickets.com/shows/5027/?date=2024-12-27	https://assets-prod.turntabletickets.com/media/icehouse/show-5027/pfmPHOTO.jpg	614	2024-12-27 18:00:00	34	Purple Funk Metropolis, Brunette	2024-12-22 21:18:28.347834	2024-12-22 21:18:28.347834	f
https://icehouse.turntabletickets.com/shows/5283/?date=2024-12-28	https://assets-prod.turntabletickets.com/media/icehouse/show-5283/Trio_Carioca_w_Mac_Dec_2024_(1).jpg	615	2024-12-28 11:00:00	34	Trio Carioca	2024-12-22 21:18:28.348636	2024-12-22 21:18:28.348636	f
https://icehouse.turntabletickets.com/shows/5122/?date=2024-12-28	https://assets-prod.turntabletickets.com/media/icehouse/show-5122/original-72C7CEF2-5F74-4174-BCC2-526ACD737B33.jpeg	616	2024-12-28 17:00:00	34	Self-Preservation Hall Band	2024-12-22 21:18:28.348997	2024-12-22 21:18:28.348997	f
https://icehouse.turntabletickets.com/shows/3958/?date=2024-12-28	https://assets-prod.turntabletickets.com/media/icehouse/show-3958/afrodesia12.28.jpg	617	2024-12-28 21:00:00	34	Ozone Creations presents: AFRODISIA	2024-12-22 21:18:28.349406	2024-12-22 21:18:28.349406	f
https://icehouse.turntabletickets.com/shows/5288/?date=2024-12-29	https://assets-prod.turntabletickets.com/media/icehouse/show-5288/wanakuPHOTO.jpg	618	2024-12-29 11:00:00	34	Kenn Wanakv	2024-12-22 21:18:28.350199	2024-12-22 21:18:28.350199	f
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	605	2025-02-24 20:00:00	9	Roe Family Singers	2024-12-22 21:18:27.514085	2024-12-22 21:18:27.514085	f
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	606	2025-02-25 21:30:00	9	February Conspiracy Series featuring, Elour	2024-12-22 21:18:27.514432	2024-12-22 21:18:27.514432	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	587	2025-02-13 21:30:00	9	TBA	2024-12-22 21:18:27.508475	2024-12-22 21:18:27.508475	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	589	2025-02-14 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.509071	2024-12-22 21:18:27.509071	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	611	2025-02-28 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.515818	2024-12-22 21:18:27.515818	f
https://www.facebook.com/share/1AAWkzwp3q/?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	588	2025-02-14 22:00:00	9	All The Pretty Horses	2024-12-22 21:18:27.508806	2024-12-22 21:18:27.508806	f
https://www.facebook.com/share/1CCMUuCWFW/?mibextid=wwXIfr	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	609	2025-02-27 21:30:00	9	Teague Alexy	2024-12-22 21:18:27.515276	2024-12-22 21:18:27.515276	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	595	2025-02-17 18:00:00	9	“Womenfolk Presents”, TBA	2024-12-22 21:18:27.510792	2024-12-22 21:18:27.510792	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	592	2025-02-16 22:30:00	9	eleven degenerates	2024-12-22 21:18:27.509938	2024-12-22 21:18:27.509938	f
https://www.instagram.com/thecrimsonboys?igsh=YXRmeHJsMHpqeXI5	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	590	2025-02-15 22:00:00	9	The Crimson Boys	2024-12-22 21:18:27.509361	2024-12-22 21:18:27.509361	f
https://www.instagram.com/switchyard.band.mpls?igsh=eTJ6OTk2eXVubHZt	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	593	2025-02-16 19:00:00	9	Switchyard	2024-12-22 21:18:27.510194	2024-12-22 21:18:27.510194	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	591	2025-02-15 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.509634	2024-12-22 21:18:27.509634	f
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	594	2025-02-17 20:00:00	9	Roe Family Singers	2024-12-22 21:18:27.510529	2024-12-22 21:18:27.510529	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	598	2025-02-20 21:30:00	9	Cross Pollination	2024-12-22 21:18:27.511781	2024-12-22 21:18:27.511781	f
https://www.berlinmpls.com/calendar/late-night-lounge-amy-pickett	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/c9098303-9d93-43bc-86d1-e4b153e18ecc/Amy+Pickett.JPG	3839	2025-01-24 21:30:00	12	Late Night Lounge: DJ Amy Pickett	2025-01-04 16:49:10.374057	2025-01-04 16:49:10.374057	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	597	2025-02-19 19:00:00	9	Harold’s House Party on KFAI, The Gentlemen’s Anti-Temperance League	2024-12-22 21:18:27.511506	2024-12-22 21:18:27.511506	f
https://www.facebook.com/share/18GmB9Muji/?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	596	2025-02-19 21:30:00	9	Stephanie Was	2024-12-22 21:18:27.511247	2024-12-22 21:18:27.511247	f
https://www.facebook.com/share/19gJPYodzy/?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	599	2025-02-21 22:00:00	9	Diane	2024-12-22 21:18:27.512134	2024-12-22 21:18:27.512134	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	600	2025-02-21 19:00:00	9	Movie Music Trivia	2024-12-22 21:18:27.512387	2024-12-22 21:18:27.512387	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	602	2025-02-22 19:00:00	9	Drinkin’ Spelling Bee	2024-12-22 21:18:27.513024	2024-12-22 21:18:27.513024	f
https://www.instagram.com/jeremylordoftheuniverse?igsh=MTJtZnp5dTZsNXp2dw==	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	601	2025-02-22 22:00:00	9	Lords of the Universe	2024-12-22 21:18:27.512753	2024-12-22 21:18:27.512753	f
https://www.facebook.com/profile.php?id=61557848086888&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	603	2025-02-23 19:00:00	9	The Real Chuck NORAD	2024-12-22 21:18:27.513525	2024-12-22 21:18:27.513525	f
https://www.facebook.com/profile.php?id=100094683949311&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	604	2025-02-24 18:00:00	9	HonkyTonk Ranch	2024-12-22 21:18:27.51384	2024-12-22 21:18:27.51384	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	608	2025-02-26 19:00:00	9	Harold’s House Party on KFAI, Ray Barnard Friends	2024-12-22 21:18:27.515002	2024-12-22 21:18:27.515002	f
https://icehouse.turntabletickets.com/shows/5233/?date=2024-12-29	https://assets-prod.turntabletickets.com/media/icehouse/show-5233/in_real_life_human_music_NOV22_DRAFT1.jpg	619	2024-12-29 17:00:00	34	in real life human music	2024-12-22 21:18:28.350951	2024-12-22 21:18:28.350951	f
https://icehouse.turntabletickets.com/r/js-ondara-an-alien-in-minneapolis	https://assets-prod.turntabletickets.com/media/icehouse/show-5074/JSOndaraPHOTO.jpg	621	2024-12-31 17:00:00	34	NYE, JS Ondara: An Alien in Minneapolis	2024-12-22 21:18:28.352684	2024-12-22 21:18:28.352684	f
https://icehouse.turntabletickets.com/shows/5407/?date=2024-12-31	https://assets-prod.turntabletickets.com/media/icehouse/show-5407/Black_Dark_and_Trendy_Disco_Party_Instagram_Reel_(12_x_16_in).png.jpg	622	2024-12-31 22:00:00	34	InMotion: NYE Gala	2024-12-22 21:18:28.353426	2024-12-22 21:18:28.353426	f
https://icehouse.turntabletickets.com/shows/5266/?date=2025-01-03	https://assets-prod.turntabletickets.com/media/icehouse/show-5266/20250103_Event_Image_4K.jpg	623	2025-01-03 18:00:00	34	Benjamin Miller, Laura Hugo, St. Rangers	2024-12-22 21:18:28.354152	2024-12-22 21:18:28.354152	f
https://icehouse.turntabletickets.com/r/brunch-with-the-other-ol-blue-eyes	https://assets-prod.turntabletickets.com/media/icehouse/show-5261/The_Other_Ol'_Blue_Eyes_by_Paul_Lundgren_low_res-1_(1).jpg	624	2025-01-04 11:00:00	34	The Other Ol' Blue Eyes	2024-12-22 21:18:28.354912	2024-12-22 21:18:28.354912	f
https://icehouse.turntabletickets.com/r/brunch-with-phil-heywood	https://assets-prod.turntabletickets.com/media/icehouse/show-5260/phil_by_john_connell_copy_(1).jpg	626	2025-01-05 11:00:00	34	Phil Heywood	2024-12-22 21:18:28.356501	2024-12-22 21:18:28.356501	f
https://icehouse.turntabletickets.com/r/brunch-with-pop-wagner	https://assets-prod.turntabletickets.com/media/icehouse/show-5279/popwagnerPHOTO.png.jpg	627	2025-01-11 11:00:00	34	Pop Wagner	2024-12-22 21:18:28.357173	2024-12-22 21:18:28.357173	f
https://icehouse.turntabletickets.com/shows/3023/?date=2025-01-12	https://assets-prod.turntabletickets.com/media/icehouse/show-3023/3443206e-8412-41b7-b7a3-c623e7f42e80.jpeg	628	2025-01-12 16:00:00	34	Sunday Salsa Matinee, Charanga Tropical	2024-12-22 21:18:28.357501	2024-12-22 21:18:28.357501	f
https://icehouse.turntabletickets.com/shows/4895/?date=2025-01-14	https://assets-prod.turntabletickets.com/media/icehouse/show-4895/accordo.jpg	629	2025-01-14 17:30:00	34	Accordo, Presented by the Schubert Club	2024-12-22 21:18:28.358205	2024-12-22 21:18:28.358205	f
https://icehouse.turntabletickets.com/r/jake-labotz-trio	https://assets-prod.turntabletickets.com/media/icehouse/show-5273/La_Botz_PHOTO_2.jpg	630	2025-01-16 18:00:00	34	Jake LaBotz Trio	2024-12-22 21:18:28.358816	2024-12-22 21:18:28.358816	f
https://icehouse.turntabletickets.com/r/jake-labotz-trio	https://assets-prod.turntabletickets.com/media/icehouse/show-5273/La_Botz_PHOTO_2.jpg	631	2025-01-23 18:00:00	34	Jake LaBotz Trio	2024-12-22 21:18:28.3593	2024-12-22 21:18:28.3593	f
https://icehouse.turntabletickets.com/shows/5368/?date=2025-01-24	https://assets-prod.turntabletickets.com/media/icehouse/show-5368/KIRK%2BLISAJ%2Bx%2BJEREMY%2BDUTCHER%2B3.jpg	632	2025-01-24 17:30:00	34	Jeremy Dutcher: Motewolonuwok ᒣᑏᐧᐁᓓᓄᐧᐁᒃ	2024-12-22 21:18:28.359648	2024-12-22 21:18:28.359648	f
https://icehouse.turntabletickets.com/r/brunch-with-ryan-picone-quartet	https://assets-prod.turntabletickets.com/media/icehouse/show-5259/ryanpiconequartetPHOTO_(1).jpg	633	2025-01-25 11:00:00	34	Ryan Picone Quartet	2024-12-22 21:18:28.360232	2024-12-22 21:18:28.360232	f
https://icehouse.turntabletickets.com/shows/5104/?date=2025-01-25	https://assets-prod.turntabletickets.com/media/icehouse/show-5104/email_(2).png.jpg	634	2025-01-25 18:00:00	34	Zaq Baker's Very Unspectacular Book Release Party, Dylan Hicks, Halle Hanson	2024-12-22 21:18:28.361363	2024-12-22 21:18:28.361363	f
https://icehouse.turntabletickets.com/r/jake-labotz-trio	https://assets-prod.turntabletickets.com/media/icehouse/show-5273/La_Botz_PHOTO_2.jpg	635	2025-01-30 18:00:00	34	Jake LaBotz Trio	2024-12-22 21:18:28.36201	2024-12-22 21:18:28.36201	f
https://icehouse.turntabletickets.com/shows/5151/?date=2025-01-31	https://assets-prod.turntabletickets.com/media/icehouse/show-5151/songslamvertical_updated.jpg	636	2025-01-31 18:00:00	34	Seventh Annual Minneapolis SongSLAM	2024-12-22 21:18:28.363189	2024-12-22 21:18:28.363189	f
https://icehouse.turntabletickets.com/r/brunch-with-the-other-ol-blue-eyes	https://assets-prod.turntabletickets.com/media/icehouse/show-5261/The_Other_Ol'_Blue_Eyes_by_Paul_Lundgren_low_res-1_(1).jpg	637	2025-02-01 11:00:00	34	The Other Ol' Blue Eyes	2024-12-22 21:18:28.363849	2024-12-22 21:18:28.363849	f
https://icehouse.turntabletickets.com/r/brunch-with-phil-heywood	https://assets-prod.turntabletickets.com/media/icehouse/show-5260/phil_by_john_connell_copy_(1).jpg	638	2025-02-02 11:00:00	34	Phil Heywood	2024-12-22 21:18:28.364371	2024-12-22 21:18:28.364371	f
https://icehouse.turntabletickets.com/r/brunch-with-pop-wagner	https://assets-prod.turntabletickets.com/media/icehouse/show-5279/popwagnerPHOTO.png.jpg	639	2025-02-08 11:00:00	34	Pop Wagner	2024-12-22 21:18:28.364934	2024-12-22 21:18:28.364934	f
https://icehouse.turntabletickets.com/r/brunch-with-the-dollys	https://assets-prod.turntabletickets.com/media/icehouse/show-5281/promo_photo_(1)_(1).jpg	641	2025-02-15 11:00:00	34	The Dollys	2024-12-22 21:18:28.36571	2024-12-22 21:18:28.36571	f
https://icehouse.turntabletickets.com/shows/5123/?date=2025-02-08	https://assets-prod.turntabletickets.com/media/icehouse/show-5123/white%2Bgreen-19_(1)_updated.jpg	640	2025-02-08 18:00:00	34	Seyi Oyinloye: The "ON3" Tour	2024-12-22 21:18:28.3654	2024-12-22 21:18:28.3654	f
https://icehouse.turntabletickets.com/shows/5185/?date=2025-02-20	https://assets-prod.turntabletickets.com/media/icehouse/show-5185/Satsang_Press_Photo_2024_(1).jpg	642	2025-02-20 19:00:00	34	Satsang, Sierra Marin	2024-12-22 21:18:28.366073	2024-12-22 21:18:28.366073	f
https://icehouse.turntabletickets.com/r/brunch-with-ryan-picone-quartet	https://assets-prod.turntabletickets.com/media/icehouse/show-5259/ryanpiconequartetPHOTO_(1).jpg	643	2025-02-22 11:00:00	34	Ryan Picone Quartet	2024-12-22 21:18:28.366611	2024-12-22 21:18:28.366611	f
https://icehouse.turntabletickets.com/r/brunch-with-the-other-ol-blue-eyes	https://assets-prod.turntabletickets.com/media/icehouse/show-5261/The_Other_Ol'_Blue_Eyes_by_Paul_Lundgren_low_res-1_(1).jpg	644	2025-03-01 11:00:00	34	The Other Ol' Blue Eyes	2024-12-22 21:18:28.367149	2024-12-22 21:18:28.367149	f
https://icehouse.turntabletickets.com/r/brunch-with-phil-heywood	https://assets-prod.turntabletickets.com/media/icehouse/show-5260/phil_by_john_connell_copy_(1).jpg	645	2025-03-02 11:00:00	34	Phil Heywood	2024-12-22 21:18:28.367696	2024-12-22 21:18:28.367696	f
https://icehouse.turntabletickets.com/r/brunch-with-pop-wagner	https://assets-prod.turntabletickets.com/media/icehouse/show-5279/popwagnerPHOTO.png.jpg	646	2025-03-08 11:00:00	34	Pop Wagner	2024-12-22 21:18:28.36807	2024-12-22 21:18:28.36807	f
https://icehouse.turntabletickets.com/r/brunch-with-the-dollys	https://assets-prod.turntabletickets.com/media/icehouse/show-5281/promo_photo_(1)_(1).jpg	647	2025-03-15 11:00:00	34	The Dollys	2024-12-22 21:18:28.368367	2024-12-22 21:18:28.368367	f
https://icehouse.turntabletickets.com/shows/5461/?date=2025-03-21	https://assets-prod.turntabletickets.com/media/icehouse/show-5461/GUMO_(1).jpg	648	2025-03-21 18:00:00	34	Ibelisse Guardia Ferragutti, Frank Rosaly - MESTIZX	2024-12-22 21:18:28.368746	2024-12-22 21:18:28.368746	f
https://icehouse.turntabletickets.com/r/brunch-with-ryan-picone-quartet	https://assets-prod.turntabletickets.com/media/icehouse/show-5259/ryanpiconequartetPHOTO_(1).jpg	649	2025-03-22 11:00:00	34	Ryan Picone Quartet	2024-12-22 21:18:28.369222	2024-12-22 21:18:28.369222	f
https://icehouse.turntabletickets.com/shows/5317/?date=2025-01-04	https://assets-prod.turntabletickets.com/media/icehouse/show-5317/1.04_poster.jpg	625	2025-01-04 18:00:00	34	Gabriel Douglas, Nate Case, Frog, the Bog	2024-12-22 21:18:28.355679	2024-12-22 21:18:28.355679	f
https://www.mortimerscalendar.com/event-details-registration/minimort-dj-minnie-blanco-every-4th-sunday-1	https://static.wixstatic.com/media/cd839d_6dad08211cf942b890243fd89fe99f16~mv2.jpg	664	2024-12-22 22:00:00	36	MINIMORT DJ MINNIE BLANCO (EVERY 4TH SUNDAY)	2024-12-22 21:19:34.190718	2024-12-22 21:19:34.190718	f
https://www.mortimerscalendar.com/event-details-registration/autotune-karaoke-2024-12-23-21-00	https://static.wixstatic.com/media/cd839d_3537e71298464005ab14551961efebd5~mv2.jpeg	665	2024-12-23 21:00:00	36	AUTOTUNE KARAOKE!	2024-12-22 21:19:34.195556	2024-12-22 21:19:34.195556	f
https://www.mortimerscalendar.com/event-details-registration/mortiholics-residency-2024-12-25-20-30	https://static.wixstatic.com/media/cd839d_8f7aaab8d0c340749a2345e8942dd608~mv2.png	667	2024-12-25 20:30:00	36	MORTIHOLICS RESIDENCY	2024-12-22 21:19:34.196218	2024-12-22 21:19:34.196218	f
https://www.mortimerscalendar.com/event-details-registration/dj-shannon-blowtorch-2	https://static.wixstatic.com/media/cd839d_a7956eb8dba5451b8dedd7c8277b6bf3~mv2.png	668	2024-12-26 22:00:00	36	DJ SHANNON BLOWTORCH	2024-12-22 21:19:34.196636	2024-12-22 21:19:34.196636	f
https://www.mortimerscalendar.com/event-details-registration/gothess-8	https://static.wixstatic.com/media/cd839d_a7956eb8dba5451b8dedd7c8277b6bf3~mv2.png	669	2024-12-27 22:00:00	36	GOTHESS	2024-12-22 21:19:34.197083	2024-12-22 21:19:34.197083	f
https://www.mortimerscalendar.com/event-details-registration/supportive-parents-blue-ox-rad-owl	https://static.wixstatic.com/media/cd839d_b0afd98b3c4640e792c62c77c372e46a~mv2.png	670	2024-12-28 22:00:00	36	Supportive Parents, Blue Ox, Rad Owl	2024-12-22 21:19:34.197589	2024-12-22 21:19:34.197589	f
https://icehouse.turntabletickets.com/shows/5178/?date=2025-04-01	https://assets-prod.turntabletickets.com/media/icehouse/show-5178/JM3_UPDATED.jpg	651	2025-04-01 18:00:00	34	Jeffrey Martin, Lou Hazel	2024-12-22 21:18:28.370135	2024-12-22 21:18:28.370135	f
https://icehouse.turntabletickets.com/shows/4988/?date=2025-04-03	https://assets-prod.turntabletickets.com/media/icehouse/show-4988/02_Ed_Davis_MG_update.jpg	652	2025-04-03 18:00:00	34	Mark Guiliana	2024-12-22 21:18:28.370555	2024-12-22 21:18:28.370555	f
https://icehouse.turntabletickets.com/r/brunch-with-the-other-ol-blue-eyes	https://assets-prod.turntabletickets.com/media/icehouse/show-5261/The_Other_Ol'_Blue_Eyes_by_Paul_Lundgren_low_res-1_(1).jpg	653	2025-04-05 11:00:00	34	The Other Ol' Blue Eyes	2024-12-22 21:18:28.371015	2024-12-22 21:18:28.371015	f
https://icehouse.turntabletickets.com/r/brunch-with-phil-heywood	https://assets-prod.turntabletickets.com/media/icehouse/show-5260/phil_by_john_connell_copy_(1).jpg	654	2025-04-06 11:00:00	34	Phil Heywood	2024-12-22 21:18:28.37155	2024-12-22 21:18:28.37155	f
https://icehouse.turntabletickets.com/r/brunch-with-pop-wagner	https://assets-prod.turntabletickets.com/media/icehouse/show-5279/popwagnerPHOTO.png.jpg	655	2025-04-12 11:00:00	34	Pop Wagner	2024-12-22 21:18:28.372013	2024-12-22 21:18:28.372013	f
https://icehouse.turntabletickets.com/r/brunch-with-the-dollys	https://assets-prod.turntabletickets.com/media/icehouse/show-5281/promo_photo_(1)_(1).jpg	656	2025-04-19 11:00:00	34	The Dollys	2024-12-22 21:18:28.372466	2024-12-22 21:18:28.372466	f
https://icehouse.turntabletickets.com/shows/5374/?date=2025-04-30	https://assets-prod.turntabletickets.com/media/icehouse/show-5374/LEAD_PHOTO_-_PC_GRAHAM_TOLBERT_(Horizontal).jpg	657	2025-04-30 20:00:00	34	Phil Cook Solo Piano	2024-12-22 21:18:28.372905	2024-12-22 21:18:28.372905	f
https://icehouse.turntabletickets.com/r/brunch-with-the-other-ol-blue-eyes	https://assets-prod.turntabletickets.com/media/icehouse/show-5261/The_Other_Ol'_Blue_Eyes_by_Paul_Lundgren_low_res-1_(1).jpg	658	2025-05-03 11:00:00	34	The Other Ol' Blue Eyes	2024-12-22 21:18:28.373378	2024-12-22 21:18:28.373378	f
https://icehouse.turntabletickets.com/r/brunch-with-phil-heywood	https://assets-prod.turntabletickets.com/media/icehouse/show-5260/phil_by_john_connell_copy_(1).jpg	659	2025-05-04 11:00:00	34	Phil Heywood	2024-12-22 21:18:28.373844	2024-12-22 21:18:28.373844	f
https://icehouse.turntabletickets.com/r/brunch-with-pop-wagner	https://assets-prod.turntabletickets.com/media/icehouse/show-5279/popwagnerPHOTO.png.jpg	660	2025-05-10 11:00:00	34	Pop Wagner	2024-12-22 21:18:28.374258	2024-12-22 21:18:28.374258	f
https://icehouse.turntabletickets.com/r/brunch-with-the-dollys	https://assets-prod.turntabletickets.com/media/icehouse/show-5281/promo_photo_(1)_(1).jpg	661	2025-05-17 11:00:00	34	The Dollys	2024-12-22 21:18:28.374697	2024-12-22 21:18:28.374697	f
https://icehouse.turntabletickets.com/r/brunch-with-ryan-picone-quartet	https://assets-prod.turntabletickets.com/media/icehouse/show-5259/ryanpiconequartetPHOTO_(1).jpg	662	2025-05-24 11:00:00	34	Ryan Picone Quartet	2024-12-22 21:18:28.375211	2024-12-22 21:18:28.375211	f
https://icehouse.turntabletickets.com/shows/4895/?date=2025-06-03	https://assets-prod.turntabletickets.com/media/icehouse/show-4895/accordo.jpg	663	2025-06-03 17:30:00	34	Accordo, Presented by the Schubert Club	2024-12-22 21:18:28.37555	2024-12-22 21:18:28.37555	f
https://www.mortimerscalendar.com/event-details-registration/autotune-karaoke-2025-01-06-21-00	https://static.wixstatic.com/media/cd839d_3537e71298464005ab14551961efebd5~mv2.jpeg	672	2025-01-06 21:00:00	36	AUTOTUNE KARAOKE!	2024-12-22 21:19:34.198325	2024-12-22 21:19:34.198325	f
https://www.mortimerscalendar.com/event-details-registration/retro-rhythms-w-dj-kenny-d-2025-02-09-22-00	https://static.wixstatic.com/media/cd839d_c14d960412c441548782aeb9b074671e~mv2.png	674	2025-02-09 22:00:00	36	Retro Rhythms, DJ Kenny D	2024-12-22 21:19:34.199172	2024-12-22 21:19:34.199172	f
https://www.berlinmpls.com/calendar/james-taylor-vinyl-dj-set-3	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/b05a8c3b-57af-4f50-a54d-09b57f81b845/JT_DJ+photo1.jpg	3842	2025-01-25 22:30:00	12	Late Night Lounge: James Taylor	2025-01-04 16:49:17.128999	2025-01-04 16:49:17.128999	f
https://www.berlinmpls.com/calendar/carbon-sound-week-4-zak-khan	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/428a59e2-8a46-45cd-bed3-c21211f87797/Zak+Khan.JPG	3843	2025-01-26 19:00:00	12	Carbon Sound Presents: Zak Khan & Friends	2025-01-04 16:49:19.434562	2025-01-04 16:49:19.434562	f
https://www.mortimerscalendar.com/event-details-registration/autotune-karaoke-2024-12-30-21-00	https://static.wixstatic.com/media/cd839d_3537e71298464005ab14551961efebd5~mv2.jpeg	671	2024-12-30 21:00:00	36	AUTOTUNE KARAOKE!	2024-12-22 21:19:34.197948	2024-12-22 21:19:34.197948	f
https://www.mortimerscalendar.com/event-details-registration/retro-rhythms-w-dj-kenny-d-2025-01-12-22-00	https://static.wixstatic.com/media/cd839d_c14d960412c441548782aeb9b074671e~mv2.png	673	2025-01-12 22:00:00	36	Retro Rhythms, DJ Kenny D	2024-12-22 21:19:34.198688	2024-12-22 21:19:34.198688	f
https://www.berlinmpls.com/calendar/last-mondays-medium-zach-january	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/5c584fe4-f8da-4745-9945-9edd31d1eab7/Medium+Zach+%26+Karl+Remus+13x10.jpg	3844	2025-01-27 19:00:00	12	Last Mondays with Medium Zach (feat. Karl Remus)	2025-01-04 16:49:21.761073	2025-01-04 16:49:21.761073	f
https://www.berlinmpls.com/calendar/early-evening-jazz-dale-alexander-january	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/b4f4f315-e336-44e1-86a8-ddcdf908f679/Dale+Alexander+1.jpg	3845	2025-01-30 16:30:00	12	Early Evening Jazz: Dale Alexander	2025-01-04 16:49:24.335624	2025-01-04 16:49:24.335624	f
https://icehouse.turntabletickets.com/shows/5073/?date=2025-03-30	https://assets-prod.turntabletickets.com/media/icehouse/show-5073/4KX4K_(1).png.jpg	650	2025-03-30 18:00:00	34	Bri Bagwell, Austin Plaine	2024-12-22 21:18:28.369649	2024-12-22 21:18:28.369649	f
https://www.berlinmpls.com/calendar/atlantis-quartet	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/317de132-4956-478c-8edc-021ee1e49d37/Atlantis+Quartet+Press+Photo+by+Benny+Moreno.jpeg	3841	2025-01-25 19:30:00	12	Atlantis Quartet	2025-01-04 16:49:14.849908	2025-01-04 16:49:14.849908	f
https://www.berlinmpls.com/calendar/early-evening-jazz-michael-o-brien	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/e79a1062-e194-4744-88a9-31670f3d5b05/Michael+O%27Brien.jpg	3847	2025-01-31 16:30:00	12	Early Evening Jazz: Michael O’Brien Trio	2025-01-04 16:49:29.924353	2025-01-04 16:49:29.924353	f
https://www.berlinmpls.com/calendar/minneapolis-string-project	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/4991e88d-ba9c-4a6b-b000-f718656d4604/Minneapolis+String+Project.jpg	3848	2025-01-31 19:30:00	12	Minneapolis String Project	2025-01-04 16:49:32.900138	2025-01-04 16:49:32.900138	f
https://www.berlinmpls.com/calendar/late-night-lounge-andrew-broder	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/4db07663-95ae-4838-ab6b-e427c3835f67/BRODER+ZPF+PRESS+PIC.jpg	3849	2025-01-31 22:30:00	12	Late Night Lounge: Andrew Broder	2025-01-04 16:49:35.161771	2025-01-04 16:49:35.161771	f
https://www.berlinmpls.com/calendar/early-evening-jazz-kenny-reichert	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/c22b3846-7135-4ac0-927d-0c45d744aa3d/Kenny+Reichert.jpg	3850	2025-02-06 16:30:00	12	Early Evening Jazz: Kenny Reichert	2025-01-04 16:49:37.360835	2025-01-04 16:49:37.360835	f
https://www.berlinmpls.com/calendar/unbothered-joy-guidry-junauda-petrus-proper-t-yasmeenah	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/5dfa9e6c-8ee6-447e-a12a-8bb9d6deff61/Joy+Guidry+%28Nykelle+DeVivo%29.jpg	3851	2025-02-06 19:30:00	12	Berlin & UNBOTHERED Present: Joy Guidry	2025-01-04 16:49:39.57541	2025-01-04 16:49:39.57541	f
https://www.berlinmpls.com/calendar/pavel-jany-global-jazz-collegium	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/30cb95f3-10db-4353-859e-337334335c7a/Global+Jazz+Collegium+2024.png	3852	2025-02-07 19:30:00	12	Pavel Jany & Global Jazz Collegium	2025-01-04 16:49:41.792023	2025-01-04 16:49:41.792023	f
https://www.berlinmpls.com/calendar/mantis-boettcher-burton-carey	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/8a6c0517-adcc-4efb-ad82-37ac3abb465b/Scott+Burton+%28Peter+McElhinney%29.jpeg	3853	2025-02-10 19:00:00	12	Mantis (Jeremy Boettcher / Scott Burton / Sean Carey)	2025-01-04 16:49:43.986465	2025-01-04 16:49:43.986465	f
https://www.berlinmpls.com/calendar/last-mondays-medium-zach-february	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/efc052c1-ab48-48d9-9f31-4691d472a4fe/Medium+Zach+13x10+%28Bump+Opera%29.jpg	3854	2025-02-16 19:00:00	12	Medium Zach	2025-01-04 16:49:46.211141	2025-01-04 16:49:46.211141	f
https://www.berlinmpls.com/calendar/lucia-sarmiento-quintet-friday	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/a6d37503-6d6a-4dfd-b250-b326f987dc1e/Lucia+Sarmiento+13x10.jpg	3855	2025-02-21 19:30:00	12	Lucia Sarmiento Quintet (Album Release)	2025-01-04 16:49:48.427819	2025-01-04 16:49:48.427819	f
https://www.berlinmpls.com/calendar/lucia-sarmiento-quintet-saturday	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/a6d37503-6d6a-4dfd-b250-b326f987dc1e/Lucia+Sarmiento+13x10.jpg	3856	2025-02-22 19:30:00	12	Lucia Sarmiento Quintet (Album Release)	2025-01-04 16:49:50.633283	2025-01-04 16:49:50.633283	f
https://www.berlinmpls.com/calendar/early-evening-jazz-monaghan-murray-linz	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/04227bd1-c45f-4a99-bd67-9371f68ae2a8/LinzMonaghanMurray.jpg	3857	2025-03-06 16:30:00	12	Early Evening Jazz: Linz / Monaghan / Murray	2025-01-04 16:49:52.840998	2025-01-04 16:49:52.840998	f
https://www.berlinmpls.com/calendar/ana-everling-quartet	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/db9b6cba-8b83-4151-aa33-4e16851b75b6/Everling+horizontal+photo+Alex+Brescanu.jpeg	3858	2025-03-08 19:30:00	12	Ana Everling Quartet	2025-01-04 16:49:55.052833	2025-01-04 16:49:55.052833	f
https://www.berlinmpls.com/calendar/early-evening-jazz-ship-duo-scamurra-petrie	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/6911c4e8-5b40-4d04-bef1-bc3c988e844b/SHiP+Duo.jpg	3860	2025-03-28 16:30:00	12	Early Evening Jazz: SHiP Duo	2025-01-04 16:49:59.451342	2025-01-04 16:49:59.451342	f
https://www.berlinmpls.com/calendar/mercer-cunningham-quintet	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/6b891f9e-db9f-4991-a30c-cca972c4b8cc/Mercer+Cunningham+Quintet.jpg	3861	2025-03-28 19:30:00	12	Mercer Patterson Quintet	2025-01-04 16:50:01.629547	2025-01-04 16:50:01.629547	f
https://www.berlinmpls.com/calendar/last-mondays-medium-zach-march	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/efc052c1-ab48-48d9-9f31-4691d472a4fe/Medium+Zach+13x10+%28Bump+Opera%29.jpg	3862	2025-03-31 19:00:00	12	Last Mondays with Medium Zach	2025-01-04 16:50:03.899908	2025-01-04 16:50:03.899908	f
https://www.berlinmpls.com/calendar/old-feels-nelson-devereaux	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/a6a0a556-039b-4945-a903-063027c8a7fc/Nelson+Devereaux+%26+Asher+Kurtz.jpg	3846	2025-01-30 19:30:00	12	Old Feels (Asher Kurtz) & Nelson Devereaux	2025-01-04 16:49:27.434701	2025-01-04 16:49:27.434701	f
https://thehookmpls.com/event/241228-tillerman/	https://thehookmpls.com/wp-content/uploads/2024/11/241227-Hook-MJ-TeaTillerman-2160x1080-Eventbrite.jpg	790	2024-12-27 19:00:00	33	Mark Joseph’s Annual “Tea For The Tillerman” Concert	2024-12-23 09:51:00.142756	2024-12-23 09:51:00.142756	f
https://link.dice.fm/pd4b7d845a9d?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-09/4b73f337-441d-4317-92a7-6835aee46d32.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	776	2025-01-07 18:30:00	32	Not Your Baby, Chief Opossum, The Weeping Covenant	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/Hbcff20fba01?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-10-09/ed64d203-5e44-4748-a755-0a02839daf54.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	777	2025-01-11 18:00:00	32	Surrounded by Water Album Release Show	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	754	2024-12-06 19:00:00	25	Doll Chaser, Kyrie Nova & the Defiant, Shitty Kickflips, thumper, 	2024-12-23 09:47:26.753115	2024-12-23 09:47:26.753115	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	755	2024-12-07 19:00:00	25	THE CAMERAS, Brother Means Ally, The Penny Peaches, Anything You Want, Free	2024-12-23 09:47:35.777886	2024-12-23 09:47:35.777886	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/d767cf114a93f055ccc07b90d77a441f.jpg	756	2024-12-08 18:30:00	25	DAISYCUTTER, Dead History, Toilet Rats, Linus, 	2024-12-23 09:47:35.779022	2024-12-23 09:47:35.779022	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	757	2024-12-09 18:30:00	25	SARAH JANE MUSIC SCHOOL SHOWCASE, free	2024-12-23 09:47:35.780259	2024-12-23 09:47:35.780259	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	758	2024-12-11 18:30:00	25	SARAH JANE MUSIC SCHOOL SHOWCASE, free	2024-12-23 09:47:35.792938	2024-12-23 09:47:35.792938	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	759	2024-12-12 18:30:00	25	cervesa muscular, Matt Caflisch’s B, Street Hassle, 	2024-12-23 09:47:35.794467	2024-12-23 09:47:35.794467	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	760	2024-12-13 19:00:00	25	DEN OF THIEVES, TBA, 	2024-12-23 09:47:35.795423	2024-12-23 09:47:35.795423	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	761	2024-12-14 18:30:00	25	AUTUMN, OBSERVANT, Darkling I Listen, Echo Signal, 	2024-12-23 09:47:35.79628	2024-12-23 09:47:35.79628	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	762	2024-12-17 18:30:00	25	BOYSINTHEROSEGARDEN, Annika, carter quinn, 	2024-12-23 09:47:35.797429	2024-12-23 09:47:35.797429	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	763	2024-12-18 18:30:00	25	Lost Evidence, Better Devils, Millennial Falcon, 	2024-12-23 09:47:35.798701	2024-12-23 09:47:35.798701	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	764	2024-12-19 18:30:00	25	ALEXANDER NATALIE, Nice., .Blue, Allergen, 	2024-12-23 09:47:35.799907	2024-12-23 09:47:35.799907	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	765	2024-12-20 19:00:00	25	ASPARAGUS, Lana Leone, SoL, 	2024-12-23 09:47:35.80127	2024-12-23 09:47:35.80127	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/67880cb7ae4d23b5f9d801f989687310.jpg	766	2024-12-21 18:30:00	25	LITTLE LEBOWSKI URBAN ACHIEVERS, Arthur Conrad, Boots & Needles, Toilet Rats, Challenger Disaster Conspiracy, 	2024-12-23 09:47:35.802275	2024-12-23 09:47:35.802275	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/a92f0405a979614066b9ea4d7c3b8ade.jpg	767	2024-12-23 18:30:00	25	Twin River, Barnacle, Sunsets Over Vlowers, DJ set - Jaa.sc, 	2024-12-23 09:47:35.803241	2024-12-23 09:47:35.803241	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	768	2024-12-26 18:30:00	25	FATHER PARANOIA, TBA, 	2024-12-23 09:47:35.804132	2024-12-23 09:47:35.804132	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/6f26c70b5c5b433a3cc5117d50e66bcf.jpg	769	2024-12-27 19:00:00	25	BLACKOUTMOB, big Kia, dd the Spektrum, , TICKETS	2024-12-23 09:47:35.804931	2024-12-23 09:47:35.804931	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/8ec526f55a82bc303a846b414d64c775.jpg	770	2024-12-28 19:00:00	25	FINICK, Delicate Friend Sylvia Dieken, 	2024-12-23 09:47:35.805647	2024-12-23 09:47:35.805647	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	771	2024-12-30 18:30:00	25	GRUDD WALLACE, Crimson Boys, Pew Pew, 	2024-12-23 09:47:35.806529	2024-12-23 09:47:35.806529	f
https://link.dice.fm/w2a2bb910b69?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-11-06/a65e4662-762b-4889-bf3b-f4fcb4bb0550.jpg?rect=0%2C135%2C1080%2C1080&w=500&h=500	778	2025-01-15 18:30:00	32	Dead by 50, Blame the Witness, Waar Party	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/vf48cee46350?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-03/447b346d-e161-4371-aa8d-62b8bb0e693d.jpg?rect=0%2C135%2C1080%2C1080&w=500&h=500	779	2025-01-17 21:00:00	32	Wax Appeal feat. E-Tones and The Excavators	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/j1b164fe58fb?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/734835ef-5442-474f-a6f9-cab0aa506c8c.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	780	2025-01-18 18:30:00	32	Juice Falls (Indy), Friends	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/Le9c10511bc1?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-03/c0b5901e-2a4c-46ed-b896-dc1ea523ffa1.jpg?rect=0%2C270%2C2160%2C2160&auto=format%2Ccompress&q=40&w=328&h=328&fit=crop&crop=faces%2Ccenter&dpr=2	775	2025-01-03 19:30:00	32	tribute night, mind out of time, Doug Otto & the Getaways, Clash Minne Rockers	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/J460c5e454ac?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/8b61ae7e-9833-434b-93a0-e1448b894fbb.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	781	2025-01-19 19:30:00	32	BELLA'S ROOM	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/Vf80f89cdfd7?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/3bc2d51c-ca14-4984-9d08-bf8dc49576ce.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	782	2025-01-20 19:00:00	32	Dashed, Modern Wildlife, Sunken Planes	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/n421afd0ae36?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/4d775449-4d93-4d39-ab1f-374c8d23aa6f.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	784	2025-01-24 18:30:00	32	Bad Idea, FarFarAway, Friends	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/Q0da4c63f1e6?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-03/d6f923f2-10c4-448c-b1ea-250e8d44d468.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	786	2025-02-01 19:30:00	32	Aberration, Nothingness, Extermination Day	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/e876bc08d5d3?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/c130dbf2-36aa-490e-9c1a-15d594adefc0.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	788	2025-03-16 19:30:00	32	FATHER PARANOIA's "MOON LOGIC" Album Release	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://link.dice.fm/Dbcb01dd972d?pid=1d4479ef	https://dice-media.imgix.net/attachments/2024-12-17/a2d1abaa-4475-4451-8406-52e43a750dc9.jpg?rect=0%2C270%2C2160%2C2160&w=500&h=500	789	2025-03-27 19:00:00	32	Gleemer, Prize Horse	2024-12-23 09:50:00.18129	2024-12-23 09:50:00.18129	f
https://thehookmpls.com/event/barbaracohen-littlelizard-levy/	https://thehookmpls.com/wp-content/uploads/2024/09/IMG_5979.jpeg	791	2024-12-28 18:30:00	33	Barbara Cohen & Little Lizard Reunion Concert, Special Guests Adam & Ava Levy	2024-12-23 09:51:00.207121	2024-12-23 09:51:00.207121	f
https://www.mortimerscalendar.com/event-details-registration/pop-punk-princess-w-dj-hot-topic-fanclub-dimitry-killstorm-4	https://static.wixstatic.com/media/cd839d_fb6fc5f6d230477db915fc5361dda905~mv2.png	666	2024-12-24 22:00:00	36	pop punk princess, dj hot topic fanclub, dimitry killstorm	2024-12-22 21:19:34.195892	2024-12-22 21:19:34.195892	f
https://icehouse.turntabletickets.com/shows/5177/?date=2024-12-23	https://assets-prod.turntabletickets.com/media/icehouse/show-5177/FG4K_Christmas-Eve-Eve-24-11-13_2.jpg	612	2024-12-23 20:00:00	34	19th annual eve eve benefit show	2024-12-22 21:18:28.340905	2024-12-22 21:18:28.340905	f
https://whitesquirrelbar.com/event/the-dans-3/	https://whitesquirrelbar.com/wp-content/uploads/The-Dans-Dec-23rd-promo-pic-scaled.jpg	494	2024-12-23 18:00:00	48	the dans	2024-12-22 21:18:24.462006	2024-12-22 21:18:24.462006	f
https://thehookmpls.com/event/acoustic-bowie/	https://thehookmpls.com/wp-content/uploads/2024/11/250110-Hook-AcousticBowie-2160x1080-Eventbrite-2048x1024.jpg	793	2025-01-10 19:00:00	33	A Holy Place To Be: Acoustic Bowie	2024-12-23 09:51:00.22304	2024-12-23 09:51:00.22304	f
https://thehookmpls.com/event/winter-hotbox/	https://thehookmpls.com/wp-content/uploads/2024/12/event-page1-2048x1024.png	794	2025-01-10 20:00:00	33	Twin Cities Botanicals presents The Winter Hotbox featuring Sonic Alloy, Green, Cause For Concern	2024-12-23 09:51:00.280467	2024-12-23 09:51:00.280467	f
https://www.berlinmpls.com/calendar/acme-collective-tml-el-nino-indigo	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/e3c49eb3-2469-4c2f-83dc-6fac4c4b62ba/TML+%26+El+Nin%CC%83o+Indigo+13x10.png	3825	2025-01-13 19:00:00	12	ACME Collective Presents: TML & El Niño Indigo	2025-01-04 16:48:38.210318	2025-01-04 16:48:38.210318	f
https://www.berlinmpls.com/calendar/slothing-deblaey-ehrlich-meffert	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/33b02843-a65d-40da-ba3c-bb1ab836b8ae/Slothing.jpeg	3826	2025-01-15 19:00:00	12	Slothing	2025-01-04 16:48:40.409137	2025-01-04 16:48:40.409137	f
https://www.berlinmpls.com/calendar/charles-gorczynski-tango-quartet	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/d31058ef-eb99-4907-a718-c978a33c74fb/CGTQ+%28with+title%29.jpg	3828	2025-01-16 19:30:00	12	Charles Gorczynski Tango Quartet	2025-01-04 16:48:44.860293	2025-01-04 16:48:44.860293	f
https://www.berlinmpls.com/calendar/early-evening-jazz-32nd-st-herbie-hancock	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/31c67bf1-0af9-4814-bce6-4c52cebef62c/32nd+Street+Jazz+poster.jpg	3830	2025-01-18 16:30:00	12	Early Evening Jazz: 32nd Street Jazz	2025-01-04 16:48:49.245343	2025-01-04 16:48:49.245343	f
https://thehookmpls.com/event/250108-spacebetween/	https://thehookmpls.com/wp-content/uploads/2023/12/402910218_382863707732817_8663328372099344551_n.jpg	792	2025-01-08 19:00:00	33	Space Between	2024-12-23 09:51:00.221648	2024-12-23 09:51:00.221648	f
https://thehookmpls.com/event/gasoline-lollipops/	https://thehookmpls.com/wp-content/uploads/2024/12/250111-Hook-GasolineLollipops-1920x1080-FB-Event-Cover.jpg	795	2025-01-11 19:00:00	33	Gasoline Lollipops, The Placaters	2024-12-23 09:51:00.281788	2024-12-23 09:51:00.281788	f
https://thehookmpls.com/event/cannababe-masqueradeball/	https://thehookmpls.com/wp-content/uploads/2024/12/final-1-2048x1024.png	796	2025-01-11 21:00:00	33	Masqueerade Ball – Presented by Cannababe & DJ Izzie P	2024-12-23 09:51:00.283063	2024-12-23 09:51:00.283063	f
https://thehookmpls.com/event/7-dirty-words/	https://thehookmpls.com/wp-content/uploads/2024/12/250117-Hook-7DirtyWords-2160x1080-Eventbrite-2048x1024.jpg	797	2025-01-17 19:30:00	33	‘7 Dirty Words’ A Celebration of The Original Culture Critic!	2024-12-23 09:51:00.284211	2024-12-23 09:51:00.284211	f
https://thehookmpls.com/event/gathering-darkness-2/	https://thehookmpls.com/wp-content/uploads/2024/11/GD2-banner-2048x1024.jpg	798	2025-01-18 19:00:00	33	Gathering Darkness 2	2024-12-23 09:51:00.285094	2024-12-23 09:51:00.285094	f
https://thehookmpls.com/event/mississippihotclub-10year/	https://thehookmpls.com/wp-content/uploads/2024/12/Hook-125-2160-x-1080-px-Facebook.jpg	800	2025-01-25 19:00:00	33	Mississippi Hot Club 10th Anniversary Party	2024-12-23 09:51:05.941067	2024-12-23 09:51:05.941067	f
https://thehookmpls.com/event/johnlouis-kelleysmith/	https://thehookmpls.com/wp-content/uploads/2024/11/250131-Mission-LouisSmith-2160x1080-Eventbrite.jpg	801	2025-01-31 19:00:00	33	John Louis, Kelley Smith	2024-12-23 09:51:05.944285	2024-12-23 09:51:05.944285	f
https://thehookmpls.com/event/dancinin-the-dead/	https://thehookmpls.com/wp-content/uploads/2024/12/January-24th-TicketingFacebook-Real-2048x1024.jpg	799	2025-01-24 20:00:00	33	‘Dancin’ in THE DEAD of Winter’	2024-12-23 09:51:00.286238	2024-12-23 09:51:00.286238	f
https://thehookmpls.com/event/boxfulofboognish-wanderingeye-viachisago/	https://thehookmpls.com/wp-content/uploads/2024/12/250131-Hook-WanderingEye-1920x1080-FB-Event-Cover.jpg	802	2025-01-31 20:00:00	33	‘A Boxful of Boognish’ featuring Wandering Eye (Ween), guest Via Chisago (Wilco)	2024-12-23 09:51:05.94506	2024-12-23 09:51:05.94506	f
https://thehookmpls.com/event/25-wintersol/	https://thehookmpls.com/wp-content/uploads/2024/11/Winter-Sol-2025-2160x1080_Banner_20241112-2048x1024.jpg	803	2025-02-01 20:30:00	33	Winter Sol 2025 :: Socktopus | Something To Do | Lost Island Society | Linus	2024-12-23 09:51:05.945722	2024-12-23 09:51:05.945722	f
https://thehookmpls.com/event/then-comes-silence/	https://thehookmpls.com/wp-content/uploads/2024/12/Feb-1-BANNER-2160-x-1080-px-2048x1024.jpg	804	2025-02-01 21:00:00	33	Then Comes Silence, Stranger Gallery, DJ Gwiingwans	2024-12-23 09:51:05.94629	2024-12-23 09:51:05.94629	f
https://thehookmpls.com/event/a-forty-year-kiss/	https://thehookmpls.com/wp-content/uploads/2024/11/250208-Hook-LiteratureLoversAfternoonOut-2160x1080-Eventbrite-2-2048x1024.jpg	805	2025-02-08 12:00:00	33	Literature Lovers’ Afternoon Out™ presents: Nickolas Butler, A FORTY YEAR KISS.	2024-12-23 09:51:05.946857	2024-12-23 09:51:05.946857	f
https://thehookmpls.com/event/south-high-swing-night/	https://thehookmpls.com/wp-content/uploads/2024/12/689302571-swing-night-2025-fb.png	806	2025-02-20 18:30:00	33	South High Swing Night	2024-12-23 09:51:05.948718	2024-12-23 09:51:05.948718	f
https://thehookmpls.com/event/ignite-deathbystereo-slowdeath-powerdam/	https://thehookmpls.com/wp-content/uploads/2024/12/IGNITE-DEATH-BY-STEREO-THE-SLOW-DEATH-POWERDAM-BANNER-2048x1024.jpg	807	2025-03-14 20:00:00	33	Ignite, Death By Stereo, The Slow Death, Powerdam	2024-12-23 09:51:05.961173	2024-12-23 09:51:05.961173	f
https://thehookmpls.com/event/an-evening-with-shannon-mcnally/	https://thehookmpls.com/wp-content/uploads/2024/08/250322-Hook-ShannonMcNally-2160x1080-Eventbrite-Website-Twitter-2048x1024.jpg	808	2025-03-22 19:30:00	33	An Evening, Shannon McNally	2024-12-23 09:51:05.962239	2024-12-23 09:51:05.962239	f
https://thehookmpls.com/event/surfer-joe/	https://thehookmpls.com/wp-content/uploads/2024/12/Your-paragraph-text-1920-x-1080-px-1-1.png	809	2025-03-23 19:00:00	33	Surfer Joe w/ Kinda Fonda Wanda & The Swongos	2024-12-23 09:51:05.962811	2024-12-23 09:51:05.962811	f
https://thehookmpls.com/event/martha-wainwright/	https://thehookmpls.com/wp-content/uploads/2024/10/250325-Hook-MarthaWainwright-2160x1080-Eventbrite-Website-Twitter.jpg	810	2025-03-25 18:30:00	33	Martha Wainwright “20th Anniversary Tour”	2024-12-23 09:51:10.300418	2024-12-23 09:51:10.300418	f
https://www.berlinmpls.com/calendar/adam-meckler-quintet	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/e80ba58a-4f71-48ef-8161-8b2ce0d84d9d/AMQ_berlin_site_square.jpeg	3831	2025-01-18 19:30:00	12	Adam Meckler Quintet	2025-01-04 16:48:51.439491	2025-01-04 16:48:51.439491	f
https://www.berlinmpls.com/calendar/late-night-lounge-mcginnis-january	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/2dbf9c7d-ebe7-4655-bec2-0b8c9c657690/McG-presskit-2+%28Farah+Frayeh%29.jpg	3832	2025-01-18 22:30:00	12	Late Night Lounge: McGinnis	2025-01-04 16:48:53.735063	2025-01-04 16:48:53.735063	f
https://www.berlinmpls.com/calendar/carbon-sound-week-3-stevie-d-untethered	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/7ac30d21-46a0-407c-9dba-2c39d91b5fe4/Stevie+%26+D.+13x10.jpg	3833	2025-01-19 19:00:00	12	Carbon Sound Presents: D. Untethered & Stevie	2025-01-04 16:48:56.14797	2025-01-04 16:48:56.14797	f
https://www.berlinmpls.com/calendar/willow-waters-earth-tones	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/d4a26090-5955-4790-80e0-a67f5d35ed1d/_willow+on+the+keys+with+peter+thomas+and+anna+of+the+earth+tones+live+at+331+club.jpg	3834	2025-01-20 19:00:00	12	Willow Waters & the Earth Tones	2025-01-04 16:48:58.456646	2025-01-04 16:48:58.456646	f
https://www.berlinmpls.com/calendar/the-cherry-pit-bible-study-open-jam-twin-cities	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/09005918-b999-425b-b135-87cbaaab185d/CherryPit_Berlin_weekly_poster.jpeg	3835	2025-01-22 19:00:00	12	The Cherry Pit Presents: Bible Study at Berlin	2025-01-04 16:49:00.749012	2025-01-04 16:49:00.749012	f
https://www.berlinmpls.com/calendar/early-evening-jazz-framework-bates-olson-epstein	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/ba167b38-b55d-4cee-b0c3-a16785e54c51/Christopher+Olson.jpeg	3837	2025-01-24 16:30:00	12	Early Evening Jazz: Framework (Chris Bates / Jay Epstein / Chris Olson)	2025-01-04 16:49:05.55579	2025-01-04 16:49:05.55579	f
https://www.berlinmpls.com/calendar/mary-prescott-kengchakaj-lucent-ground	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/44b080dd-dda6-4b49-b1e0-4dd223e785d9/LucentGround5.jpg	3838	2025-01-24 20:00:00	12	Mary Prescott’s “Lucent Ground” with Kengchakaj	2025-01-04 16:49:07.884775	2025-01-04 16:49:07.884775	f
https://www.berlinmpls.com/calendar/early-evening-jazz-ethan-ostrow-dan-carpel	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/1f3cddbb-107c-4472-8213-53511dcec1fa/Berlin+1.25+Photo.png	3840	2025-01-25 16:30:00	12	Early Evening Jazz: Ethan Ostrow and Dan Carpel	2025-01-04 16:49:12.634974	2025-01-04 16:49:12.634974	f
https://www.berlinmpls.com/calendar/0m0p43qfrfrj5i6ku75cef81u4omo1-cylbs-fyr9r-n4h6y-mennz-jww2g-4btzn-hgx7f-ztrfj-jk993-mfe4p-km9yj-fc522	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/c77d6a9b-8eb2-4cfd-b4e9-cdba311480f1/Kelly+Moran+18+-+credit+Brandon+Bowen.jpg	3859	2025-03-22 20:00:00	12	Berlin & Liquid Music Present: Kelly Moran	2025-01-04 16:49:57.245096	2025-01-04 16:49:57.245096	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c5477a96eea707e5c52eaa819cc373d3.jpg	1718	2025-01-09 18:30:00	25	galleon, cause for concern, danger bad	2024-12-30 14:12:25.444225	2024-12-30 14:12:25.444225	f
https://icehouse.turntabletickets.com/shows/5548/?date=2025-01-12	https://assets-prod.turntabletickets.com/media/icehouse/show-5548/GDsunBrunchIceHBates20241080.jpg	1645	2025-01-12 11:00:00	34	dead brunch - never miss a sunday brunch, Test	2024-12-30 13:46:51.337359	2024-12-30 13:46:51.337359	f
https://icehouse.turntabletickets.com/shows/5547/?date=2025-01-15	https://assets-prod.turntabletickets.com/media/icehouse/show-5547/Ice_Horse_1_15_Poster.jpg	1648	2025-01-15 17:00:00	34	Ice Horse Mikkel Beckman, Jeff Ray	2024-12-30 13:46:51.340316	2024-12-30 13:46:51.340316	f
https://icehouse.turntabletickets.com/shows/5546/?date=2025-02-23	https://assets-prod.turntabletickets.com/media/icehouse/show-5546/2.23_hour_mpls_IG.png.jpg	1663	2025-02-23 17:00:00	34	Pat Keen's Bug Band, Hour	2024-12-30 13:46:51.352265	2024-12-30 13:46:51.352265	f
https://icehouse.turntabletickets.com/r/december-mondays-curated-by-aby-wolf	https://assets-prod.turntabletickets.com/media/icehouse/show-5121/4KX4K_(4).png.jpg	620	2024-12-30 17:00:00	34	McKain Lakey, JT Bates	2024-12-22 21:18:28.351836	2024-12-22 21:18:28.351836	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c5477a96eea707e5c52eaa819cc373d3.jpg	1719	2025-01-10 19:00:00	25	ihavenolove, Mishi Mega, Beggars, the Meshes, All ages, 	2024-12-30 14:12:25.446108	2024-12-30 14:12:25.446108	f
https://www.berlinmpls.com/calendar/late-night-lounge-ben-ivascu	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/fb2cf68a-2d1e-46f6-81af-00a7b9720898/Ben+Ivascu.jpg	3823	2025-01-11 22:15:00	12	Late Night Lounge: Ben Ivascu	2025-01-04 16:48:33.818102	2025-01-04 16:48:33.818102	f
https://www.berlinmpls.com/calendar/carbon-sound-week-2-jovon-williams-echo	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/76da829c-0e47-4075-82e9-668f3647673b/Jovon+%26+Julian+13x10.jpg	3824	2025-01-12 19:00:00	12	Carbon Sound Presents: Jovon Williams Quartet & echo	2025-01-04 16:48:36.021656	2025-01-04 16:48:36.021656	f
https://first-avenue.com/event/2024-12-a-prairie-home-companion-christmas-fri/	https://first-avenue.com/wp-content/uploads/2024/07/APrairieHomeCompanion-dec2024-1080.jpg	33	2024-12-13 19:30:00	50	A Prairie Home Companion	2024-12-22 21:11:34.012966	2024-12-22 21:11:34.012966	f
https://first-avenue.com/event/2024-12-magic-underground/	https://first-avenue.com/wp-content/uploads/2024/10/MagicUnderground-HolidayGala-121524-1080x1669-1.jpg	47	2024-12-15 19:00:00	46	The Magic Underground, Pizpor, Noah Sonie, Christopher Leuck, Mike Davis, Roger Wells, Lily Meyer	2024-12-22 21:11:45.992634	2024-12-22 21:11:45.992634	f
https://first-avenue.com/event/2024-12-the-big-wu/	https://first-avenue.com/wp-content/uploads/2024/10/BigWu-122124-1080.jpg	66	2024-12-21 19:30:00	8	The Big Wu, The People Brothers Band	2024-12-22 21:12:05.540183	2024-12-22 21:12:05.540183	f
https://first-avenue.com/event/2024-12-the-honeydogs/	https://first-avenue.com/wp-content/uploads/2024/11/TheHoneydogs-122624-1080.jpg	72	2024-12-26 20:00:00	46	The Honeydogs, The Penny Peaches	2024-12-22 21:12:12.393271	2024-12-22 21:12:12.393271	f
https://first-avenue.com/event/2025-01-landon-conrath-wk2/	https://first-avenue.com/wp-content/uploads/2024/09/LandonConrath-jan2025-1080v1.jpg	182	2025-01-09 20:00:00	1	Landon Conrath, Keep For Cheap, Andrew Garden	2024-12-22 21:13:22.442316	2024-12-22 21:13:22.442316	f
https://first-avenue.com/event/2025-01-goo-goo-mucks-worlds-forgotten-boys-rudegirl/	https://first-avenue.com/wp-content/uploads/2024/11/GooGooMucks-011025-1080.jpg	183	2025-01-10 20:00:00	46	GOO GOO MUCKS (A Tribute to The Cramps + more), The World’s Forgotten Boys (Stooges Tribute ft. members of Impaler, Dumpster Juice, ex-Satan’s Satyrs), RuDeGiRL (The Clash tribute)	2024-12-22 21:13:23.280707	2024-12-22 21:13:23.280707	f
https://first-avenue.com/event/2024-12-lo-moon/	https://first-avenue.com/wp-content/uploads/2024/04/LoMoon-120124-1080.jpg	1	2024-12-01 20:00:00	1	Lo Moon, Mayfly Moon	2024-12-22 21:10:55.074824	2024-12-22 21:10:55.074824	f
https://first-avenue.com/event/2024-12-allman-betts-family-revival/	https://first-avenue.com/wp-content/uploads/2024/07/AllmanBettsFamilyRevival_120124-1080x1669-1.jpg	3	2024-12-01 20:00:00	51	The Allman Betts Band, Devon Allman Band, Duane Betts & Palmetto Motel	2024-12-22 21:10:58.806797	2024-12-22 21:10:58.806797	f
https://first-avenue.com/event/2025-01-the-dregs/	https://first-avenue.com/wp-content/uploads/2024/12/TheDregs-012225-1080x1669v1.jpg	214	2025-01-22 19:00:00	1	The Dregs, Polivon, SoulFlower, Yana the Mooncricket, Flores de Olivo, DJ Lemony	2024-12-22 21:14:00.129066	2024-12-22 21:14:00.129066	f
https://www.greenroommn.com#/events/113660	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_54ee1208918ecc5df514714a6c86111fc8fa458fda207d35aa57f7dc80122cdb.png	1494	2025-01-02 19:00:00	22	SNAPPED Live Band Open Mic	2024-12-30 13:46:43.689039	2024-12-30 13:46:43.689039	f
https://www.greenroommn.com#/events/124364	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_072e30f8f11d1185496c826a9e616ba854858358845826ebabdc193d4cabe4d5.png	1495	2025-01-03 20:30:00	22	Some Sh!tty Cover Band - NEW YEAR, SAME SH!TTY COVER BAND, TIX AVAIL AT THE DOOR ONLY	2024-12-30 13:46:43.702099	2024-12-30 13:46:43.702099	f
https://first-avenue.com/event/2025-01-one-hit-wonders/	https://first-avenue.com/wp-content/uploads/2024/12/OneHitWonders-012325-1080x1669-1.jpg	1243	2025-01-23 20:00:00	46	Emily Casselman, Jennifer Eckes, Matthew French, Dan Israel, Zachary Scot Johnson, Nikki Lemire, Mother Banjo, Leslie Rich, Atom Robinson, Colleen Somerville, Katy Tessman, Katy Vernon, Leslie Vincent, Nicole Wilder	2024-12-30 13:41:11.39833	2024-12-30 13:41:11.39833	f
https://first-avenue.com/event/2025-01-best-new-bands/	https://first-avenue.com/wp-content/uploads/2024/12/BestNewBands2024-1080x1669-1.jpg	238	2025-01-31 19:00:00	8	Bizhiki, Christy Costello, The Dalmatian Club, Kiernan, Mati, porch light, room3, Joey Peterson(Radio K), Krista Wax(KFAI), Sean McPherson(Jazz88)	2024-12-22 21:14:30.459554	2024-12-22 21:14:30.459554	f
https://first-avenue.com/event/2025-02-david-gray/	https://first-avenue.com/wp-content/uploads/2024/09/DavidGray-020325-1080v1.jpg	249	2025-02-03 19:30:00	51	David Gray, Sierra Spirit	2024-12-22 21:14:45.23098	2024-12-22 21:14:45.23098	f
https://first-avenue.com/event/2025-02-jamie-miller/	https://first-avenue.com/wp-content/uploads/2024/10/JamieMiller-022025-1080v1.jpg	279	2025-02-20 19:30:00	7	Jamie Miller, Alex Sampson, Garrett Adair	2024-12-22 21:15:22.271808	2024-12-22 21:15:22.271808	f
https://first-avenue.com/event/2025-02-spin-doctors/	https://first-avenue.com/wp-content/uploads/2024/10/SpinDoctors-022225-1080.jpg	284	2025-02-22 20:00:00	24	Spin Doctors, Aortic Fire, Gina Schock of the Go-Go’s	2024-12-22 21:15:27.627714	2024-12-22 21:15:27.627714	f
https://first-avenue.com/event/2025-02-pert-near-sandstone/	https://first-avenue.com/wp-content/uploads/2024/11/PertNearSandstone-Winter2025-1080x1669-1.jpg	295	2025-02-28 20:00:00	46	Pert Near Sandstone, Dig Deep, Katey Bellville	2024-12-22 21:15:39.999309	2024-12-22 21:15:39.999309	f
https://first-avenue.com/event/2025-03-twin-cities-ballet-presents-romeo-juliet-sun/	https://first-avenue.com/wp-content/uploads/2024/10/TCB-RJ-Mar2025-1080v0.jpg	319	2025-03-09 14:00:00	50	Twin Cities Ballet presentsRomeo & Juliet: The Rock Ballet, live music byMark Joseph's Dragon Attack	2024-12-22 21:16:10.638354	2024-12-22 21:16:10.638354	f
https://first-avenue.com/event/2025-03-waylon-wyatt/	https://first-avenue.com/wp-content/uploads/2024/11/WaylonWyatt-032825-1080.jpg	354	2025-03-28 19:30:00	1	Waylon Wyatt	2024-12-22 21:16:52.168367	2024-12-22 21:16:52.168367	f
https://first-avenue.com/event/2025-03-mayhem-decibel-magazine/	https://first-avenue.com/wp-content/uploads/2024/12/DecibelTour-032925-1080x1669-1.jpg	356	2025-03-29 18:30:00	8	Mayhem, Mortiis, Imperial Triumphant, New Skeletal Faces	2024-12-22 21:16:53.09207	2024-12-22 21:16:53.09207	f
https://first-avenue.com/event/2025-04-dawes/	https://first-avenue.com/wp-content/uploads/2024/09/Dawes-041825-1080.jpg	390	2025-04-18 19:00:00	8	Dawes, Winnetka Bowling League	2024-12-22 21:17:24.139269	2024-12-22 21:17:24.139269	f
https://first-avenue.com/event/2025-04-jane-remover/	https://first-avenue.com/wp-content/uploads/2024/12/JaneRemover-042325-1080.jpg	397	2025-04-23 19:00:00	1	Jane Remover, Dazegxd, d0llywood1	2024-12-22 21:17:28.56288	2024-12-22 21:17:28.56288	f
https://first-avenue.com/event/2025-05-magnolia-park/	https://first-avenue.com/wp-content/uploads/2024/12/MagnoliaPark-050725-1080.jpg	426	2025-05-07 18:30:00	7	Magnolia Park, Hot Milk, Savage Hands, South Arcade	2024-12-22 21:17:50.616831	2024-12-22 21:17:50.616831	f
https://first-avenue.com/event/2025-07-teddy-swims/	https://first-avenue.com/wp-content/uploads/2024/10/TeddySwims-070625-1080.jpg	461	2025-07-06 20:00:00	5	Teddy Swims	2024-12-22 21:18:13.270009	2024-12-22 21:18:13.270009	f
https://first-avenue.com/event/2025-07-trombone-shorty-orleans-avenue/	https://first-avenue.com/wp-content/uploads/2024/12/TromboneShorty-071125-1080x1656-1.jpg	463	2025-07-11 19:00:00	43	Trombone Shorty & Orleans Avenue, JJ Grey & Mofro	2024-12-22 21:18:15.16588	2024-12-22 21:18:15.16588	f
https://whitesquirrelbar.com/event/eldest-daughter-tuesday-night-residency-3/	https://whitesquirrelbar.com/wp-content/uploads/5.png	1518	2025-01-07 21:00:00	48	eldest daughter, emma jeanne, cassandra johnson	2024-12-30 13:46:45.111691	2024-12-30 13:46:45.111691	f
https://whitesquirrelbar.com/event/david-lopez-friends/	https://whitesquirrelbar.com/wp-content/uploads/image0-7.jpeg	1519	2025-01-11 13:00:00	48	David Lopez & Friends	2024-12-30 13:46:45.115569	2024-12-30 13:46:45.115569	f
https://whitesquirrelbar.com/event/bryan-odeen/	https://whitesquirrelbar.com/wp-content/uploads/odeen_bee1.jpeg	1520	2025-01-10 18:00:00	48	Bryan Odeen	2024-12-30 13:46:45.11648	2024-12-30 13:46:45.11648	f
https://whitesquirrelbar.com/event/poorwill/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	1521	2025-01-11 21:00:00	48	Poorwill	2024-12-30 13:46:45.117121	2024-12-30 13:46:45.117121	f
https://whitesquirrelbar.com/event/pearl-parkway/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	1522	2025-01-12 21:00:00	48	Pearl Parkway	2024-12-30 13:46:45.118716	2024-12-30 13:46:45.118716	f
https://whitesquirrelbar.com/event/jumbles-w-clidesfeld-billy-the-shoe/	https://whitesquirrelbar.com/wp-content/uploads/Album-Release-Show-Poster.png	492	2025-01-06 21:00:00	48	Jumbles, Clidesfeld, Billy the Shoe, Carcetti	2024-12-22 21:18:24.442985	2024-12-22 21:18:24.442985	f
https://whitesquirrelbar.com/event/molly-maher-her-disbelievers-w-special-guests-3/	https://whitesquirrelbar.com/wp-content/uploads/mollymayerres.jpeg	1529	2025-01-08 18:00:00	48	Molly Maher & Her Disbelievers, Special Guests	2024-12-30 13:46:45.124938	2024-12-30 13:46:45.124938	f
https://whitesquirrelbar.com/event/clare-flaherty/	https://whitesquirrelbar.com/wp-content/uploads/clare-flaherty-flyer-fr.png	1530	2025-01-09 18:00:00	48	Clare Flaherty	2024-12-30 13:46:45.125469	2024-12-30 13:46:45.125469	f
https://whitesquirrelbar.com/event/the-new-havoline-supremes-11/	https://whitesquirrelbar.com/wp-content/uploads/NewHavolineSupremeslogo.jpg	1531	2025-01-07 18:00:00	48	The New Havoline Supremes	2024-12-30 13:46:45.125867	2024-12-30 13:46:45.125867	f
https://whitesquirrelbar.com/event/oceanographer-w-damn-phibian-sunnbather/	https://whitesquirrelbar.com/wp-content/uploads/Beach-Party-112-White-Squirrel.png	1535	2025-01-12 13:00:00	48	Oceanographer, Damn Phibian, Sunnbather	2024-12-30 13:46:45.129379	2024-12-30 13:46:45.129379	f
https://whitesquirrelbar.com/event/mumblin-drews-oldfangled-orchestrators/	https://whitesquirrelbar.com/wp-content/uploads/mumblindrews.jpg	1536	2025-01-13 18:00:00	48	Mumblin' Drew's Oldfangled Orchestrators	2024-12-30 13:46:45.129855	2024-12-30 13:46:45.129855	f
https://whitesquirrelbar.com/event/topiary-blush-w-thomas-richey-bakermiller-pink/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	1537	2025-01-10 21:00:00	48	Topiary Blush, Thomas Richey, Bakermiller Pink	2024-12-30 13:46:45.130398	2024-12-30 13:46:45.130398	f
https://whitesquirrelbar.com/event/tba-2/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	1538	2025-01-08 21:00:00	48	The People's March Preparty	2024-12-30 13:46:45.130691	2024-12-30 13:46:45.130691	f
https://whitesquirrelbar.com/event/fxrmnk/	https://whitesquirrelbar.com/wp-content/uploads/White-Squirrel-1.9.25-Insta-1.png	1539	2025-01-09 21:00:00	48	FXRMNK, Charles Asch, Ait Ait	2024-12-30 13:46:45.130977	2024-12-30 13:46:45.130977	f
https://whitesquirrelbar.com/event/cave-canary-w-special-guest/	https://whitesquirrelbar.com/wp-content/uploads/Cave-Canary-–-Wide.png	1541	2025-01-11 18:00:00	48	Cave Canary, Monica Livorsi	2024-12-30 13:46:45.131927	2024-12-30 13:46:45.131927	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	524	2025-01-02 21:30:00	9	NORTHEAST INVITATIONAL	2024-12-22 21:18:27.481022	2024-12-22 21:18:27.481022	f
https://www.thecedar.org/events/first-avenue-presents-will-burkart	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/1722862226186-YDGYMPHO4U35S887KEJQ/WillBurkart-1080x1080.jpg	3970	2025-01-11 19:00:00	16	FIRST AVENUE PRESENTS: WILL BURKART	2025-01-04 17:37:13.183166	2025-01-04 17:37:13.183166	f
https://www.greenroommn.com#/events/124871	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_c3de2a5475182b06e0d4c83fbbc1dde644ff236f25c347e24ed3a3e87df4bfea.png	1497	2025-01-06 18:30:00	22	Only Every Monday, Longest Running Weekly Music Variety Show	2024-12-30 13:46:43.706725	2024-12-30 13:46:43.706725	f
https://www.greenroommn.com#/events/113661	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_54ee1208918ecc5df514714a6c86111fc8fa458fda207d35aa57f7dc80122cdb.png	1499	2025-01-09 19:00:00	22	SNAPPED Live Band Open Mic	2024-12-30 13:46:43.708925	2024-12-30 13:46:43.708925	f
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	556	2025-01-22 19:00:00	9	Harold’s House Party on KFAI, Dan Rumsey	2024-12-22 21:18:27.496089	2024-12-22 21:18:27.496089	f
https://www.facebook.com/pages/Lenz-and-Frenz/1515949742024571	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	607	2025-02-26 21:30:00	9	Lenz Frenz, (Certain members of Pert Near Sandstone, Farmhouse Band, San Souci Quartet, Row of Ducks)	2024-12-22 21:18:27.514751	2024-12-22 21:18:27.514751	f
https://www.facebook.com/pages/Lenz-and-Frenz/1515949742024571	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	566	2025-01-29 21:30:00	9	Lenz Frenz, (Certain members of Pert Near Sandstone, Farmhouse Band, San Souci Quartet, Row of Ducks)	2024-12-22 21:18:27.500914	2024-12-22 21:18:27.500914	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	1597	2025-02-03 18:00:00	9	The Glasgow Tunnock’s Snack Pants society presents – j. Prufrock’s Roll-Pant Stompers	2024-12-30 13:46:50.391073	2024-12-30 13:46:50.391073	f
https://www.facebook.com/share/1F4cbTr6dk/?mibextid=wwXIfr	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	1554	2025-01-06 18:00:00	9	Soul Trouvère	2024-12-30 13:46:50.367691	2024-12-30 13:46:50.367691	f
https://www.greenroommn.com#/events/126662	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_47834429dbb50d0dfd7eeb4318a817e132d8a6f93eaecee14eec6aa433ce3f2d.png	1500	2025-01-12 22:00:00	22	Synastry Sundays, Every Sunday Night Starting at 10pm	2024-12-30 13:46:43.710725	2024-12-30 13:46:43.710725	f
https://www.greenroommn.com#/events/113662	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_54ee1208918ecc5df514714a6c86111fc8fa458fda207d35aa57f7dc80122cdb.png	1502	2025-01-16 19:00:00	22	SNAPPED Live Band Open Mic	2024-12-30 13:46:43.716186	2024-12-30 13:46:43.716186	f
https://www.greenroommn.com#/events/126663	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_47834429dbb50d0dfd7eeb4318a817e132d8a6f93eaecee14eec6aa433ce3f2d.png	1503	2025-01-19 22:00:00	22	Synastry Sundays, Every Sunday Night Starting at 10pm	2024-12-30 13:46:43.717446	2024-12-30 13:46:43.717446	f
https://www.greenroommn.com#/events/124873	https://s3.amazonaws.com/files.venuepilot.com/attachments/3c50e3ec06bf28aeecc444d946a9b2861ee806f353ff7f588b56f60f019a42f4.png	1504	2025-01-20 18:30:00	22	Only Every Monday, Minneapolis' longest running variety show	2024-12-30 13:46:43.718453	2024-12-30 13:46:43.718453	f
https://www.greenroommn.com#/events/124874	https://s3.amazonaws.com/files.venuepilot.com/attachments/3c50e3ec06bf28aeecc444d946a9b2861ee806f353ff7f588b56f60f019a42f4.png	1506	2025-01-27 18:30:00	22	Only Every Monday, Minneapolis' Longest running variety show	2024-12-30 13:46:43.720267	2024-12-30 13:46:43.720267	f
https://www.thecedar.org/events/volunteer-orientation	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/68713f1d-1b09-4244-a237-418662d52f91/Image+of+Cedar+Marquee.PNG	3971	2025-01-13 17:30:00	16	Volunteer Orientation	2025-01-04 17:37:13.253938	2025-01-04 17:37:13.253938	f
https://www.thecedar.org/events/honky-tonk-takeover-f-jack-klatt-trio-mckain-lakey-band	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/d7a68c1a-dafb-449f-a053-3ee4b990c800/Jack_Klatt_Press+%282%29.JPG	3972	2025-01-17 20:00:00	16	HONKY TONK TAKEOVER f. JACK KLATT TRIO, McKAIN LAKEY BAND	2025-01-04 17:37:13.257014	2025-01-04 17:37:13.257014	f
https://www.thecedar.org/events/tc-trans-mutual-aid-trans-day-of-revenge-featuring-slog-more	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/aa4ac32d-e2ee-4b00-9e03-ca639e36733f/897974-business-logo-mpz9cfskk04g1717965443-600.jpg	3973	2025-01-18 19:00:00	16	TC TRANS MUTUAL AID "Trans Day of Revenge" featuring S.L.O.G., more!	2025-01-04 17:37:13.259332	2025-01-04 17:37:13.259332	f
https://www.thecedar.org/events/the-cedar-commissions-night-one-ap-looze-hibah-hassan-phillip-st-john	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/a92ed3f2-a7db-4909-a10a-51d9f36c5d2a/CC_Banner+N1.png	3974	2025-01-31 19:30:00	16	THE CEDAR COMMISSIONS Night One: A.P. Looze, Hibah Hassan, Phillip Saint John	2025-01-04 17:37:13.261559	2025-01-04 17:37:13.261559	f
https://www.thecedar.org/events/the-cedar-commissions-night-two-john-jamison-ii-may-klug-yeej	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/21f33c29-96f7-4409-8761-4b17247eea8e/CC_Banner+N2.png	3975	2025-02-01 19:30:00	16	THE CEDAR COMMISSIONS Night Two: John Jamison II, May Klug, Yeej	2025-01-04 17:37:13.263094	2025-01-04 17:37:13.263094	f
https://www.thecedar.org/events/the-qalanjo-project-presents-echoes-from-the-horn-somali-lives-in-cinema	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/4052225a-231e-44aa-b1ad-d05163adbd21/LIFE+ON+THE+HORN+Promo+Image.jpg	3976	2025-02-02 11:00:00	16	The Qalanjo Project Presents: Echoes from the Horn: Somali Lives in Cinema	2025-01-04 17:37:13.2663	2025-01-04 17:37:13.2663	f
https://www.thecedar.org/events/nordic-roots-series-lena-jonsson-trio-with-ponyfolk	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/1ceb58b0-6b64-42ea-bdf4-81fa33f1db78/Kopia+av+1911-LJT_02_586k8L.jpg	3977	2025-02-06 19:30:00	16	NORDIC ROOTS SERIES: LENA JONSSON TRIO, Ponyfolk	2025-01-04 17:37:13.268142	2025-01-04 17:37:13.268142	f
https://www.thecedar.org/events/samora-pinderhughes-with-tbd-special-guest	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/9283be94-3bb7-4cbb-9bdc-65abe7e81f62/https___tbaagency.com_wp-content_uploads_2023_08_SCOVERSHOOT8843-1-scaled.jpg	3978	2025-02-07 20:00:00	16	SAMORA PINDERHUGHES, TBD special guest	2025-01-04 17:37:13.269836	2025-01-04 17:37:13.269836	f
https://www.thecedar.org/events/larry-joe-with-tbd-special-guest	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/7ea3338e-edb1-4ca1-b507-3f12dc23611e/06+-+Larry+%26+Joe+-+credit+Tommy+Coyote.jpg	3979	2025-02-08 20:00:00	16	LARRY, JOE with TBD special guest	2025-01-04 17:37:13.272993	2025-01-04 17:37:13.272993	f
https://www.thecedar.org/events/an-evening-with-guy-davis	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/01ef411b-3655-472c-b7e8-8d5ace46c127/5guydavis-rosenlr.jpg	3980	2025-02-11 19:30:00	16	An Evening, GUY DAVIS	2025-01-04 17:37:13.275365	2025-01-04 17:37:13.275365	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/635f386b70a34d205aa33fbbc5ed4792.jpg	1715	2025-01-06 18:00:00	25	aaron james, jj sweetheart, ditch pigeon	2024-12-30 14:12:25.442252	2024-12-30 14:12:25.442252	f
https://www.thecedar.org/events/the-okee-dokee-brothers-early-show	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/830da174-f5f7-49f7-8d8a-8ee7fe941bbb/standing-on-water.jpg	3983	2025-02-16 11:00:00	16	THE OKEE DOKEE BROTHERS (early show)	2025-01-04 17:37:13.28267	2025-01-04 17:37:13.28267	f
https://www.thecedar.org/events/the-okee-dokee-brothers-late-show	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/3a29e513-a71d-447a-a05b-aad4bcf84d2b/Creek+Final+JM+JL.jpg	3984	2025-02-16 14:00:00	16	THE OKEE DOKEE BROTHERS (late show)	2025-01-04 17:37:13.310173	2025-01-04 17:37:13.310173	f
https://www.thecedar.org/events/the-craft-hip-hop-songwriters-showcase	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/f3e56a3f-1e28-49f4-9500-be8c42934728/craft+flyer+final.jpg	3985	2025-02-22 20:00:00	16	THE CRAFT ~Hip Hop Songwriters Showcase	2025-01-04 17:37:13.442016	2025-01-04 17:37:13.442016	f
https://www.thecedar.org/events/guitar-band-release-show-with-fake-accent-and-the-miami-dolphins	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/74d64fea-3d01-420d-a8ad-0ef6dbc193d8/Screen+Shot+2024-12-16+at+8.20.17+PM.png	3986	2025-02-27 19:00:00	16	GUITAR BAND release show with Fake Accent, The Miami Dolphins	2025-01-04 17:37:13.46881	2025-01-04 17:37:13.46881	f
https://www.thecedar.org/events/the-cedar-presents-talisk-and-gardiner-brothers-unleashed	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/91bea5b0-f994-40af-a5aa-01065934806d/PROMO+PIC+%28Landscape%29.jpg	3987	2025-02-28 20:00:00	16	The Cedar Presents TALISK, GARDINER BROTHERS: UNLEASHED	2025-01-04 17:37:13.473042	2025-01-04 17:37:13.473042	f
https://first-avenue.com/event/2025-02-mustafa/	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/346adce7-e928-4893-b7ff-0c084def7672/Mustafa+11x17+%281%29+%282%29.jpg	3982	2025-02-15 20:00:00	16	Mustafa	2025-01-04 17:37:13.279648	2025-01-04 17:37:13.279648	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c5477a96eea707e5c52eaa819cc373d3.jpg	1717	2025-01-08 18:30:00	25	bailey thiel, 	2024-12-30 14:12:25.443642	2024-12-30 14:12:25.443642	f
https://link.dice.fm/G617f376043d?pid=1d4479ef	\N	1710	2025-01-04 19:30:00	32	Little Man, The Slow Death, Dakota Shakedown	2024-12-30 13:58:43.992177	2024-12-30 13:58:43.992177	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/2ac5b5ce3780e01c795e9ba9d399c9bf.png	1714	2025-01-04 19:00:00	25	jared mccloud, nobody from nowhere, cassandra cole, 	2024-12-30 14:12:25.441131	2024-12-30 14:12:25.441131	f
https://www.mortimerscalendar.com/event-details-registration/a-very-assortment-nye-dance-party-feat-michael-grey	https://static.wixstatic.com/media/cd839d_a427c7ea4717453da0e7933a3173912a~mv2.jpg	1685	2024-12-31 22:00:00	36	A Very Assortment NYE Dance Party feat. Michael Grey!!	2024-12-30 13:48:02.089717	2024-12-30 13:48:02.089717	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	1711	2025-01-01 18:00:00	25	Scremo Wednesday, Pointless Animal, Father Melissa, townsquaremassacre, 	2024-12-30 14:12:06.188886	2024-12-30 14:12:06.188886	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/6a2828cfd481b62578f9e0392028d434.jpg	1716	2025-01-07 19:00:00	25	Songbird Series, All ages, 	2024-12-30 14:12:25.443061	2024-12-30 14:12:25.443061	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/9ddddabfcd79fa530e0466fda59787b6.png	1713	2025-01-03 18:30:00	25	1947, sonic sea turtles, the del-viles	2024-12-30 14:12:25.440482	2024-12-30 14:12:25.440482	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	1712	2025-01-02 18:30:00	25	Lena Nine, tba	2024-12-30 14:12:25.439012	2024-12-30 14:12:25.439012	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c1f8012644af09f27f1fde69a7bf0fd6.jpg	1720	2025-01-11 19:00:00	25	The Nut, Mouthful, Walker Rider, All ages, , Tickets	2024-12-30 14:12:25.446839	2024-12-30 14:12:25.446839	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c5477a96eea707e5c52eaa819cc373d3.jpg	1721	2025-01-12 17:30:00	25	Pursuit, VolsungaSaga, The F All, Defiled Sacrament, All ages, 	2024-12-30 14:12:25.448686	2024-12-30 14:12:25.448686	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/cc4ea5036776c936db8207f08841b18a.jpg	1722	2025-01-15 18:30:00	25	Quail, Sunsets over Flowers, Magick Flavour Station, All Ages, 	2024-12-30 14:12:25.449439	2024-12-30 14:12:25.449439	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/ba1a692ea6caae592af8f413d799bfa6.jpg	1723	2025-01-16 18:30:00	25	Dusty Forever, Oftener, Val Son, All Ages, 	2024-12-30 14:12:25.450124	2024-12-30 14:12:25.450124	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/340098c26118a6b52ab4a951cdcc2253.jpg	1724	2025-01-17 19:00:00	25	Lana Leone, 12th house Sun, Linus, Lily Blue, All Ages, 	2024-12-30 14:12:25.450711	2024-12-30 14:12:25.450711	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/a6d728f8dd0bdcdcd1d57f065152a7fb.jpg	1725	2025-01-21 18:00:00	25	Duck Bomb, tba, All Ages, 	2024-12-30 14:12:25.451282	2024-12-30 14:12:25.451282	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/90496f5a58ba5a61007e458d1cc2333b.jpg	1726	2025-01-22 18:00:00	25	Blow the FM Radio, 1947, Fretrattles, All Ages, 	2024-12-30 14:12:25.451947	2024-12-30 14:12:25.451947	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/1f526081879873075a86193074e07159.jpg	1727	2025-01-23 18:00:00	25	Mouthful, Thumper, Drey Dk, All Ages, 	2024-12-30 14:12:25.452637	2024-12-30 14:12:25.452637	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/f8d57a9c13644d759330239ad37f6b01.jpg	1728	2025-01-24 18:00:00	25	Admiral Fox, Kyrie Nova, the Defiant, BlueDriver, Doll Chaser, All Ages, 	2024-12-30 14:12:25.453261	2024-12-30 14:12:25.453261	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/ee18c8c7e6fe0a5e17fe5e8527d6e09a.jpg	1729	2025-01-29 18:00:00	25	Jordy Vaughn, Priscilla Momah Scinnlaece, All Ages, 	2024-12-30 14:12:25.45384	2024-12-30 14:12:25.45384	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/1412020d8a0a82fabb968d9923c5267c.jpg	1730	2025-01-30 18:00:00	25	Calla Mae, Cute Intensions, Sylvia Dieken, All Ages, 	2024-12-30 14:12:25.454436	2024-12-30 14:12:25.454436	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/106d47e7905b6c27062120419f983ccc.jpg	1731	2025-01-31 19:00:00	25	APHID, Waking Hours Berzica, All Ages, 	2024-12-30 14:12:25.455082	2024-12-30 14:12:25.455082	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/f921506c7e26da85b251e7867182c5fc.jpg	1733	2025-02-19 19:00:00	25	In Solid Air, Galleon, The Grieving Pines, All Ages, Advance, Day of Show, TICKETS	2024-12-30 14:12:25.456403	2024-12-30 14:12:25.456403	f
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/168db52d0c9234b93fb37e57d7230475.jpg	1732	2025-02-01 19:00:00	25	yellow ostrich, fend, kiernan	2024-12-30 14:12:25.4557	2024-12-30 14:12:25.4557	f
https://www.instagram.com/p/DEITE8JSisX/	https://res.cloudinary.com/dsll3ms2c/image/upload/v1735853381/Screenshot_2025-01-02_at_3.28.55_PM_d8c8nu.png	1760	2025-01-04 19:30:00	52	Calla Mae, glitterpit, Mystery Meat, Rigby	2025-01-02 15:31:22.498364	2025-01-02 15:31:22.498364	f
https://www.instagram.com/dot.operator.music?igsh=MTlpYWVkZWt0ank5dw==	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	554	2025-01-21 21:30:00	9	January Conspiracy Series featuring, Dot Operator, Bridal Style	2024-12-22 21:18:27.495343	2024-12-22 21:18:27.495343	f
https://www.thecedar.org/events/kris-delmhorst-with-rose-cousins	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/bf574914-010d-4bfc-ad4c-824c8b2dce96/KD%2BBAND%2BB_W%2BHORIZONTAL%2B%28Louise%2BBichan%29.jpg	3989	2025-03-08 20:00:00	16	KRIS DELMHORST, Rose Cousins	2025-01-04 17:37:13.486891	2025-01-04 17:37:13.486891	f
https://www.thecedar.org/events/duke-concept-presents-calledout-music-best-days-of-our-lives-tour	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/358a2864-cb7e-4002-b26c-8b7578bbf0dd/Press+shot+2.jpeg	3990	2025-03-15 20:00:00	16	Duke Concept Presents: CALLEDOUT MUSIC ~BEST DAYS OF OUR LIVES TOUR	2025-01-04 17:37:13.489842	2025-01-04 17:37:13.489842	f
https://www.thecedar.org/events/an-evening-with-sissoko-segal-parisien-peirani-les-gars	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/da1ba512-efdc-48f9-a3b5-d577151b3fa5/ChambreDouble-Gassian9515+%281%29.jpg	3991	2025-03-27 19:30:00	16	An Evening, SISSOKO, SEGAL, PARISIEN, PEIRANI: LES ÉGARÉS	2025-01-04 17:37:13.492356	2025-01-04 17:37:13.492356	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2259	2025-01-21 20:00:00	9	Worker’s Playtime, Jeff Ray	2025-01-03 18:38:39.478044	2025-01-03 18:38:39.478044	f
https://www.thecedar.org/events/an-evening-with-alash-0	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/b988e042-1a5e-483a-a09f-d3963471b74e/alash_tuva_2012_composite-3.jpg	3992	2025-03-30 19:30:00	16	An Evening, ALASH	2025-01-04 17:37:13.494433	2025-01-04 17:37:13.494433	f
https://www.thecedar.org/events/basia-bulat-basias-palace-live-in-concert	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/e031e89c-1b22-47f8-8547-005851abb6a8/Screenshot+2024-09-30+at+3.35.05+PM.png	3993	2025-04-04 20:00:00	16	BASIA BULAT ~ Basia's Palace Live in Concert	2025-01-04 17:37:13.49611	2025-01-04 17:37:13.49611	f
https://www.thecedar.org/events/flore-laurentienne-with-tbd-special-guest	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/10b6f9f9-cf77-44b9-863b-f1ed96492aaf/lead+photo___Flore+Laurentinne+%C2%A9+Charline+Clavier.jpg	3994	2025-04-05 20:00:00	16	FLORE LAURENTIENNE, TBD special guest	2025-01-04 17:37:13.497538	2025-01-04 17:37:13.497538	f
https://thehookmpls.com/event/barbaracohen-littlelizard-levy/	https://thehookmpls.com/wp-content/uploads/2024/09/IMG_0368-1-2048x758.jpeg	1755	2025-03-01 18:30:00	33	Barbara Cohen & Little Lizard Reunion Concert, Special Guests Adam & Ava Levy	2024-12-30 14:16:26.614624	2024-12-30 14:16:26.614624	f
http://www.drsketchy.com	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2251	2025-01-12 14:00:00	9	Dr. Sketchy’s Anti-Art School, 2-4pm	2025-01-03 18:38:39.471234	2025-01-03 18:38:39.471234	f
https://www.facebook.com/jeffraymusic1?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	525	2025-01-03 22:00:00	9	jeff ray trio	2024-12-22 21:18:27.481725	2024-12-22 21:18:27.481725	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2246	2025-01-07 20:00:00	9	Worker’s Playtime, CED	2025-01-03 18:38:39.465587	2025-01-03 18:38:39.465587	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2253	2025-01-14 20:00:00	9	Worker’s Playtime, Stephanie Was	2025-01-03 18:38:39.472895	2025-01-03 18:38:39.472895	f
https://www.thecedar.org/events/an-evening-with-cheryl-wheeler-kenny-white	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/46c88f31-7f7c-42af-921a-9f1a0deaa5f3/cherylwheeler1.jpg	3995	2025-04-16 19:30:00	16	An Evening with CHERYL WHEELER, KENNY WHITE	2025-01-04 17:37:13.50108	2025-01-04 17:37:13.50108	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2261	2025-01-25 20:00:00	9	Drinkin’ Spelling Bee, 7pm	2025-01-03 18:38:39.481917	2025-01-03 18:38:39.481917	f
https://www.thecedar.org/events/farah-siraj-with-tbd-special-guest	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/f0a983a7-b48b-4aa2-8120-e8ab810fa214/Farah+Siraj_Photo+by+Richard+Ramos.jpg	3996	2025-04-18 20:00:00	16	FARAH SIRAJ, TBD special guest	2025-01-04 17:37:13.502404	2025-01-04 17:37:13.502404	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2266	2025-01-31 20:00:00	9	Movie Music Trivia, 7pm	2025-01-03 18:38:39.485422	2025-01-03 18:38:39.485422	f
https://www.thecedar.org/events/the-arcadian-wild-with-tbd	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/e71e22e1-aa48-4127-9e11-5f5bf7754e25/-TheArcadianWild_0323-90-ShelbyMick.jpg	3997	2025-04-30 19:30:00	16	THE ARCADIAN WILD, TBD	2025-01-04 17:37:13.503605	2025-01-04 17:37:13.503605	f
https://www.thecedar.org/events/the-cedar-presents-valerie-june-owls-omens-and-oracles-tour	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/579dfe2e-a741-4c39-802c-4b2654d27426/Gerber+Daisy_Valerie+June.jpg	3998	2025-05-31 20:00:00	16	THE CEDAR Presents VALERIE JUNE ~Owls, Omens,, Oracles Tour~	2025-01-04 17:37:13.504771	2025-01-04 17:37:13.504771	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2272	2025-02-07 20:00:00	9	Movie Music Trivia, 7pm	2025-01-03 18:38:39.489705	2025-01-03 18:38:39.489705	f
https://www.thecedar.org/events/mpls-afrobeats-dance-party-f-fananka-nation-guests-bakarii-djs-kwey-and-salif-keita	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/6f3e21bb-c562-4e63-ae83-635158a405d7/image0+%2812%29.jpeg	3999	2024-12-14 20:00:00	16	MPLS AFROBEATS DANCE PARTY f. FANAKA NATION + guests BAKARII, DJs Kwey, Salif Keita	2025-01-04 17:37:13.505792	2025-01-04 17:37:13.505792	f
http://www.drsketchy.com	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2274	2025-02-09 14:00:00	9	Dr. Sketchy’s Anti-Art School, 2-4pm	2025-01-03 18:38:39.491463	2025-01-03 18:38:39.491463	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2279	2025-02-15 20:00:00	9	Drinkin’ Spelling Bee, 7pm	2025-01-03 18:38:39.495429	2025-01-03 18:38:39.495429	f
https://www.thecedar.org/events/mr-sun-plays-ellingtons-nutcracker	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/b36bd3f1-756b-42d6-b043-f5bf9d3992ac/Screenshot+2024-09-24+at+3.29.37+PM.png	4001	2024-12-12 19:30:00	16	MR SUN Plays Ellington’s Nutcracker	2025-01-04 17:37:13.509677	2025-01-04 17:37:13.509677	f
https://www.thecedar.org/events/ben-cook-feltzs-4th-annual-holiday-shindig	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/370fa413-7178-489b-9f15-6e1405ac4684/holiday+shindig+2024.png	4002	2024-12-08 14:00:00	16	BEN COOK-FELTZ's 4TH ANNUAL HOLIDAY SHINDIG!	2025-01-04 17:37:13.511214	2025-01-04 17:37:13.511214	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2287	2025-02-21 20:00:00	9	Movie Music Trivia, 7pm	2025-01-03 18:38:39.502059	2025-01-03 18:38:39.502059	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2289	2025-02-23 20:00:00	9	TBA, 3-5pm	2025-01-03 18:38:39.502826	2025-01-03 18:38:39.502826	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2327	2025-01-19 17:00:00	9	Dakota Dave Hull	2025-01-03 18:40:43.687307	2025-01-03 18:40:43.687307	f
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2283	2025-02-18 21:00:00	9	February Conspiracy Series featuring, Elour, 9:00	2025-01-03 18:38:39.499158	2025-01-03 18:38:39.499158	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2284	2025-02-18 20:00:00	9	Worker’s Playtime, TBA	2025-01-03 18:38:39.499901	2025-01-03 18:38:39.499901	f
https://www.facebook.com/share/18aZ5bw86L/?mibextid=wwXIfr	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2340	2025-01-26 17:00:00	9	Doyle Turner	2025-01-03 18:40:43.692773	2025-01-03 18:40:43.692773	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2265	2025-01-28 20:00:00	9	Worker’s Playtime, Phil Heywood	2025-01-03 18:38:39.484692	2025-01-03 18:38:39.484692	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2393	2025-02-23 17:00:00	9	TBA	2025-01-03 18:40:43.709871	2025-01-03 18:40:43.709871	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2292	2025-02-25 20:00:00	9	Worker’s Playtime, TBA	2025-01-03 18:38:39.503939	2025-01-03 18:38:39.503939	f
https://www.facebook.com/corpserevivermpls?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2351	2025-02-02 17:00:00	9	Corpse Reviver	2025-01-03 18:40:43.697408	2025-01-03 18:40:43.697408	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2271	2025-02-04 20:00:00	9	Worker’s Playtime, TBA	2025-01-03 18:38:39.488919	2025-01-03 18:38:39.488919	f
http://www.drsketchy.com	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2364	2025-02-09 16:00:00	9	Dr. Sketchy’s Anti-Art School	2025-01-03 18:40:43.701855	2025-01-03 18:40:43.701855	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2277	2025-02-11 20:00:00	9	Worker’s Playtime, TBA	2025-01-03 18:38:39.493757	2025-01-03 18:38:39.493757	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2378	2025-02-16 17:00:00	9	TBA	2025-01-03 18:40:43.705879	2025-01-03 18:40:43.705879	f
https://www.facebook.com/corpserevivermpls?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2299	2025-01-05 17:00:00	9	Corpse Reviver	2025-01-03 18:40:43.672555	2025-01-03 18:40:43.672555	f
https://www.instagram.com/chriscashinmusic?igsh=eDR5aG12NHBza3lo	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2615	2025-02-28 22:00:00	9	Chris Cashin	2025-01-04 15:49:12.210379	2025-01-04 15:49:12.210379	f
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2307	2025-01-09 19:00:00	9	Drinking Liberally hosts	2025-01-03 18:40:43.678179	2025-01-03 18:40:43.678179	f
http://www.drsketchy.com	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	2421	2025-01-12 16:00:00	9	Dr. Sketchy’s Anti-Art School	2025-01-04 15:48:10.68762	2025-01-04 15:48:10.68762	f
https://www.thecedar.org/events/flowers-now-a-celebration-of-black-elders-of-the-arts-community	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/9212de34-4bee-4e40-a8ac-1798b41170f6/image0.jpeg	4003	2024-12-07 20:00:00	16	Flowers Now! A Celebration of Black Elders of the Arts Community	2025-01-04 17:37:13.51281	2025-01-04 17:37:13.51281	f
https://www.thecedar.org/events/antje-duvekot-seth-glier	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/fcb4bb96-4168-4ddc-bdcd-ade362689d43/Antje+%2B+Seeth.png	4004	2024-12-06 20:00:00	16	ANTJE DUVEKOT+ SETH GLIER	2025-01-04 17:37:13.515647	2025-01-04 17:37:13.515647	f
https://www.thecedar.org/events/lemon-bucket-orkestra-with-ukrainian-village-band	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/9de20097-b23d-4477-b6aa-1dac90778902/LBO+PROMO+PHOTO+2024+-+HORIZONTAL+-+NGCamille.jpg	4005	2024-12-05 19:30:00	16	LEMON BUCKET ORKESTRA, Ukrainian Village Band	2025-01-04 17:37:13.527593	2025-01-04 17:37:13.527593	f
https://www.thecedar.org/events/the-band-of-heathens-duo-f-ed-jurdi-and-gordy-quist-with-chris-and-ari-silver	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/94af9e12-05f3-4249-af29-16849bad4125/boh_179.jpg	4006	2024-11-22 20:00:00	16	THE BAND OF HEATHENS DUO f. Ed Jurdi, Gordy Quist with Chris, Ari Silver	2025-01-04 17:37:13.530953	2025-01-04 17:37:13.530953	f
https://www.thecedar.org/events/an-evening-with-paul-metzger-krissy-bergmark	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/eb3fb31c-d848-4024-8560-22970637aa50/PAUL+METZGER+%26+KRISSY+BERGMARK.png	4007	2024-11-21 19:30:00	16	🚫CANCELED🚫 Evening with PAUL METZGER, KRISSY BERGMARK	2025-01-04 17:37:13.53685	2025-01-04 17:37:13.53685	f
https://www.thecedar.org/events/bad-posture-club-a-farewell-show-with-voulouse	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/3a8e901e-fd27-4fc0-a4f1-db4ed7d6ac9a/DSC02001.jpg	4008	2024-11-20 19:30:00	16	BAD POSTURE CLUB ~A Farewell Show~, voulouse	2025-01-04 17:37:13.538675	2025-01-04 17:37:13.538675	f
https://www.thecedar.org/events/extreme-noise-records-presents-zero-boys-sick-thoughts-long-knife-color-tv-and-citric-dummies	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/3bf32eb1-33cd-4502-99f2-5ff69ebf5797/ZeroBoys_band.jpg	4009	2024-11-16 19:00:00	16	Extreme Noise Records Presents: Zero Boys, Sick Thoughts, Long Knife, Color TV,, Citric Dummies	2025-01-04 17:37:13.540929	2025-01-04 17:37:13.540929	f
https://www.thecedar.org/events/duke-concept-presents-oxlade-/-oxlade-from-africa-tour-z47gg	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/18484408-b138-44f6-9d3f-188336518d38/oxlade-SM.jpg	4010	2024-11-15 20:00:00	16	Duke Concept Presents: OXLADE From Africa Tour	2025-01-04 17:37:13.542891	2025-01-04 17:37:13.542891	f
https://www.thecedar.org/events/an-evening-with-habib-koit-aly-keita-lamine-cissokho-mand-sila	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/e76f97a1-ea13-49de-9fba-5de03af9881f/Screenshot+2024-08-13+at+12.23.44+PM.png	4011	2024-11-13 19:30:00	16	An Evening, HABIB KOITÉ, ALY KEITA, LAMINE CISSOKHo "Mandé Sila"	2025-01-04 17:37:13.544783	2025-01-04 17:37:13.544783	f
https://www.thecedar.org/events/an-evening-with-david-wilcox	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/fbdc8f17-6a62-437f-94dc-2eacd6ad46a6/DavidWilcoxatWolfie20-EditLV.jpg	4012	2024-11-10 19:30:00	16	An Evening, DAVID WILCOX	2025-01-04 17:37:13.546663	2025-01-04 17:37:13.546663	f
https://www.thecedar.org/events/prairie-fire-choir-13th-season-finale-withmeghan-kreidler	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/42c55eed-fd7e-4acf-9d0a-66263a422e81/IMG_6617.jpg	4013	2024-11-09 20:00:00	16	PRAIRIE FIRE CHOIR -13th Season Finale- with Meghan Kreidler	2025-01-04 17:37:13.548162	2025-01-04 17:37:13.548162	f
https://www.thecedar.org/events/mariee-siou-with-donnie-coco	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/f8e994fd-14f1-4b8d-9417-2485e43f3bb9/Mariee+Red+-+Nicolas+Stokes.JPG	4014	2024-11-06 19:30:00	16	MARIEE SIOU, Donnie CoCo	2025-01-04 17:37:13.549371	2025-01-04 17:37:13.549371	f
https://www.thecedar.org/events/afghan-cultural-society-anniversary-arts-festival-2024	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/97618253-5d89-4da4-9955-d8347a07ec58/anniversary_banner-08.jpg	4015	2024-11-03 17:00:00	16	Afghan Cultural Society Anniversary Arts Festival 2024	2025-01-04 17:37:13.550607	2025-01-04 17:37:13.550607	f
https://www.thecedar.org/events/r-ta-confirmed-tlalnepantla-arts-presents-12th-annual-festival-de-las-calaveras-twin-cities-latinx-music-arts-festival	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/4a9b8159-97f7-4558-8abc-3b7349d81082/06_27_24+-+POSTS+%2B+COVERS+-+1.jpg	4016	2024-11-02 18:00:00	16	️️️️️Tlalnepantla Arts Presents: 12th Annual FESTIVAL DE LAS CALAVERAS: Twin Cities Latinx Music, Arts Festival	2025-01-04 17:37:13.551818	2025-01-04 17:37:13.551818	f
https://www.thecedar.org/events/john-mceuen-the-circle-band-with-the-eclectics	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/b9ee432a-3092-4fa2-b7b6-9ee37dfa9387/McEuen-Solo-Shot.jpg	4017	2024-11-01 20:00:00	16	JOHN McEUEN, The Circle Band with The Eclectics	2025-01-04 17:37:13.553852	2025-01-04 17:37:13.553852	f
https://www.thecedar.org/events/one-day-early-voting-pop-up	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/4c1ad876-aa33-4511-b644-afb7695a4387/CCC-1-CCC+.png	4018	2024-10-31 11:00:00	16	One-Day Early Voting Pop-Up	2025-01-04 17:37:13.55548	2025-01-04 17:37:13.55548	f
https://www.thecedar.org/events/cedar-celebration	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/e088189a-403d-48d9-a23e-ba6806e8c90d/The+Cedar+Celebration+-+Banner.png	4019	2024-10-26 16:00:00	16	THE CEDAR CELEBRATION! Hosted by DESSA	2025-01-04 17:37:13.556893	2025-01-04 17:37:13.556893	f
https://www.thecedar.org/events/sister-species-release-show-with-theo-langason	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/14190844-174a-4cbd-9e95-9ebffe885200/20240715-sisterspecies_2023_by_isabelfajardo-R5__2677EYESCLOSED.jpg	4020	2024-10-24 19:30:00	16	SISTER SPECIES ~release show~, Theo Langason	2025-01-04 17:37:13.558033	2025-01-04 17:37:13.558033	f
https://www.thecedar.org/events/first-avenue-presents-rachael-yamagata-unseen-hearts-tourwith-sandy-bell	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/06012c6f-45a8-4faa-b878-5280ed8d9a44/RachaelYamagata-1080x1080.jpg	4021	2024-10-19 20:00:00	16	FIRST AVENUE PRESENTS: RACHAEL YAMAGATA ~Unseen Hearts Tour~, Sandy Bell	2025-01-04 17:37:13.559582	2025-01-04 17:37:13.559582	f
https://www.thecedar.org/events/the-arab-blues-with-amwaaj	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/dd708815-2ec4-4c59-b3d7-c3e4512ff369/TAB_8265.jpg	4022	2024-10-18 20:00:00	16	THE ARAB BLUES, Amwaaj	2025-01-04 17:37:13.560421	2025-01-04 17:37:13.560421	f
https://www.thecedar.org/events/first-avenue-presents-hania-rani	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/e062eeb2-95d2-4f15-90c3-889f010c278f/HaniaRani-1080x1080.jpg	4023	2024-10-13 20:00:00	16	FIRST AVENUE PRESENTS: HANIA RANI	2025-01-04 17:37:13.561175	2025-01-04 17:37:13.561175	f
https://www.thecedar.org/events/yungchen-lhamo-with-broken-caterpillar	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/4286c4a6-4b8c-4617-bb05-06c847547706/YUNGCHENLHAMO_2023_DY_09+copy.jpeg	4024	2024-10-12 20:00:00	16	YUNGCHEN LHAMO, Broken Caterpillar	2025-01-04 17:37:13.561914	2025-01-04 17:37:13.561914	f
https://www.thecedar.org/events/extreme-noise-records-presents-gorilla-biscuits-with-big-laugh-and-more	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/6e775b73-cc75-4c4c-b47a-a5af32c29e61/gorillabiscuits.png	4025	2024-10-11 19:00:00	16	❗sold out❗Extreme Noise Records Presents: GORILLA BISCUITS with Big Laugh, more!	2025-01-04 17:37:13.563061	2025-01-04 17:37:13.563061	f
https://first-avenue.com/event/2025-02-eivor/	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/24346eb9-f493-4c05-bb62-ad75f67662fb/Eivor-1080x1080+%281%29+%281%29.jpg	3981	2025-02-14 20:00:00	16	Eivør, Sylvaine	2025-01-04 17:37:13.276958	2025-01-04 17:37:13.276958	f
https://www.berlinmpls.com/calendar/early-evening-jazz-henry-berberi-chet-carlson	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/0eeb4e46-f9a3-4f3c-beae-493bde797d13/Henry+Berberi+%26+Chet+Carlson+13x10.jpg	3810	2025-01-04 16:30:00	12	Early Evening Jazz: Henry Berberi / Chet Carlson	2025-01-04 16:48:03.149473	2025-01-04 16:48:03.149473	f
https://www.berlinmpls.com/calendar/abinnet-berhanu-genet-abate-ahndenet	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/d4923eaa-f50a-4f6f-a6f3-a113734e34de/Abinnet+Berhanu+and+Ahndenet+13x10.jpg	3811	2025-01-04 19:30:00	12	Abinnet Berhanu's Ahndenet አንድነት feat. Genet Abate	2025-01-04 16:48:07.624369	2025-01-04 16:48:07.624369	f
https://www.berlinmpls.com/calendar/late-night-lounge-dj-yoni	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/eb661586-5132-4702-8dfd-ca99a81157e6/DJ+Yoni.jpeg	3812	2025-01-04 22:30:00	12	Late Night Lounge: DJ Yoni	2025-01-04 16:48:09.821906	2025-01-04 16:48:09.821906	f
https://www.thecedar.org/events/john-craigie-with-tre-burt	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/86b58131-d3a3-467d-acea-5a8341d95165/JohnCraigie-11x17.jpg	4026	2024-10-08 19:30:00	16	FIRST AVENUE PRESENTS:                  JOHN CRAIGIE, Tré Burt	2025-01-04 17:37:13.564528	2025-01-04 17:37:13.564528	f
https://www.thecedar.org/events/alessandro-cortini-with-aida-shahghasemi-jeremy-max-ylvisaker	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/56921ac2-25f2-4b3b-9b25-9e15790a91cd/AlessandroCortni2024_5hori.jpg	4027	2024-10-07 19:30:00	16	ALESSANDRO CORTINI with Aida Shahghasemi, Jeremy, Max Ylvisaker	2025-01-04 17:37:13.565593	2025-01-04 17:37:13.565593	f
https://www.thecedar.org/events/robin-and-linda-williams-with-maya-de-vitry	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/e8b9ec0e-eadf-4b0f-a61d-62602edaa982/RLW2021b-768x512.jpeg	4028	2024-10-05 20:00:00	16	ROBIN, LINDA WILLIAMS with Maya de Vitry	2025-01-04 17:37:13.566631	2025-01-04 17:37:13.566631	f
https://www.berlinmpls.com/calendar/classical-goes-jazz-nate-hance	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/f8ff1517-7e38-498d-8141-92cd02319c59/Nate+Hance+Trio+image.png	3817	2025-01-09 19:30:00	12	Classical Goes Jazz	2025-01-04 16:48:20.698001	2025-01-04 16:48:20.698001	f
https://www.berlinmpls.com/calendar/early-evening-jazz-goggin-kaufmann-strachan	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/296e805c-7e28-40e9-9b15-060ceb27cdd1/Goggin++Kaufmann++Strachan+13x10.jpg	3818	2025-01-10 16:30:00	12	Early Evening Jazz: Goggin / Kaufmann / Strachan	2025-01-04 16:48:22.867172	2025-01-04 16:48:22.867172	f
https://www.berlinmpls.com/calendar/kevin-gamble-quartet	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/e4929e42-7c1f-42cb-b71f-fe807abfd629/Kevin+Gamble+Quartet.jpg	3819	2025-01-10 19:30:00	12	Kevin Gamble Quartet	2025-01-04 16:48:25.062849	2025-01-04 16:48:25.062849	f
https://www.berlinmpls.com/calendar/chris-wilbourn	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/143720a3-c623-4808-bfeb-ae13da546f12/MRNC+Photo1.jpg	3820	2025-01-10 22:15:00	12	Late Night Lounge: Chris Wilbourn (aka Felix of Heiruspecs)	2025-01-04 16:48:27.245408	2025-01-04 16:48:27.245408	f
https://www.berlinmpls.com/calendar/carbon-sound-week-1-obi-original-alexis-rose	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/2a39336a-9f7f-49ca-a167-d884e305717a/Obi+Original+%26+Alexis+Rose+13x10.jpg	3813	2025-01-05 19:00:00	12	Carbon Sound Presents: Obi Original & Alexis Rose	2025-01-04 16:48:11.988662	2025-01-04 16:48:11.988662	f
https://www.berlinmpls.com/calendar/lasse-corson-trio	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/f15843c3-1ef0-43f4-8b4a-8c0ad78d059a/lasseheadBWOLD.jpg	3814	2025-01-06 19:00:00	12	Lasse Corson Trio	2025-01-04 16:48:14.226706	2025-01-04 16:48:14.226706	f
https://www.berlinmpls.com/calendar/joan-hutton-trio-kameron-markworth-chris-hepola-2	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/deb246dd-906e-4255-adc6-93206fd812cc/Untitled+design+%281%29.jpg	3815	2025-01-08 19:00:00	12	Joan Hutton Trio	2025-01-04 16:48:16.418946	2025-01-04 16:48:16.418946	f
https://www.berlinmpls.com/calendar/early-evening-jazz-will-aldrich-trio	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/233632cd-3a2f-4bd7-b847-983818191c2f/05C0920B-114A-4C11-8AF2-4DA067C2DDC4+%281%29.jpeg	3816	2025-01-09 16:30:00	12	Early Evening Jazz: Will Aldrich Trio	2025-01-04 16:48:18.599157	2025-01-04 16:48:18.599157	f
https://www.berlinmpls.com/calendar/trish-graydon-early-evening-jazz-jan-11	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/4b9e7bea-6e04-45cd-b772-0ce497ab5f77/Trish+Hurd-Paczkowski.jpg	3821	2025-01-11 16:30:00	12	Early Evening Jazz: Trish Hurd-Paczkowski / Graydon Peterson (feat. Peter Goggin)	2025-01-04 16:48:29.442176	2025-01-04 16:48:29.442176	f
https://www.berlinmpls.com/calendar/will-schmid-senseless-violets-joanna-mcdonald	https://images.squarespace-cdn.com/content/v1/658316152e826a3bbbfc0aef/148f68f6-961c-472d-9dd7-0e1b3389f0ff/senseless_violets.jpg	3822	2025-01-11 19:30:00	12	Senseless Violets & Opalesce	2025-01-04 16:48:31.620982	2025-01-04 16:48:31.620982	f
https://www.google.com/calendar/event?eid=MHNvcXRhZ2RiYW1hYnI5c2loY2F0MTVyODkgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4181	2025-01-04 19:00:00	20	The Hobbled, Sidewalk Diamonds, Rebecca Fritz	2025-01-04 18:25:50.815358	2025-01-04 18:25:50.815358	f
https://www.google.com/calendar/event?eid=M2lsNWpmOWNvODdtYXU2OHFnNXE0N2ZlNGYgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4182	2025-01-04 19:30:00	20	New Riverside Ramblers	2025-01-04 18:25:50.83716	2025-01-04 18:25:50.83716	f
https://www.google.com/calendar/event?eid=N3Yycm5jZjFuajlwaGdwM3BjdGxqMjFjN3FfMjAyNTAxMDVUMjAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4183	2025-01-05 14:30:00	20	Country Doctors	2025-01-04 18:25:50.837828	2025-01-04 18:25:50.837828	f
https://www.google.com/calendar/event?eid=N25vbGhwajgwa2hwZDdtN3BoaXRzNmsxMHFfMjAyNTAxMDdUMDEwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4184	2025-01-06 19:00:00	20	Steve Clarke 'n' Band	2025-01-04 18:25:50.838433	2025-01-04 18:25:50.838433	f
https://www.google.com/calendar/event?eid=NXE0aDJoN29qbW9jbHI0ZTB0dXI3aDBndDEgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4185	2025-01-10 20:00:00	20	Catfish Seagal	2025-01-04 18:25:50.839094	2025-01-04 18:25:50.839094	f
https://www.google.com/calendar/event?eid=Mmo0aTZyaWxjazJvZ2hwMDh0cGdrZzMwa3FfMjAyNTAxMTFUMTkwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4186	2025-01-11 13:00:00	20	Secret Drawing Club	2025-01-04 18:25:50.839546	2025-01-04 18:25:50.839546	f
https://www.google.com/calendar/event?eid=Nm8wYXRlMW00aXM4aGZ1cjIzbzFjYmRkdXYgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4187	2025-01-11 18:30:00	20	Winter Wonderband	2025-01-04 18:25:50.841892	2025-01-04 18:25:50.841892	f
https://www.google.com/calendar/event?eid=NmhkNHZha2lzOGEybGRnbjJrcjZlM2QxYnEgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4188	2025-01-12 14:30:00	20	Robinson Roundup	2025-01-04 18:25:50.842418	2025-01-04 18:25:50.842418	f
https://www.google.com/calendar/event?eid=MmI2dDQyZGg5YWYxdmszNjByYXBhZnI4MHVfMjAyNTAxMTZUMDEwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4189	2025-01-15 19:00:00	20	Ton Up Mpls	2025-01-04 18:25:50.842952	2025-01-04 18:25:50.842952	f
https://www.google.com/calendar/event?eid=MnYwczdmNnRxZHMzdGk3aHEzbzc4cHZiYmcgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4190	2025-01-19 14:30:00	20	Tailspin	2025-01-04 18:25:50.84338	2025-01-04 18:25:50.84338	f
https://www.google.com/calendar/event?eid=MzI1NjdwMmFpYjFyMjQ4bzUxa3NraDJsMGpfMjAyNTAxMjFUMTUwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4191	2025-01-21 09:00:00	20	MRTI	2025-01-04 18:25:50.843797	2025-01-04 18:25:50.843797	f
https://www.google.com/calendar/event?eid=YzlqM2VlYjFjbGo2MmI5bmNsaW1hYjlrY2dxamNiOXBjNWlqNGJiMzZsaWo4bzlqNjhvajZjcjM2NCB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4192	2025-01-25 19:00:00	20	Roxxy Hall	2025-01-04 18:25:50.84418	2025-01-04 18:25:50.84418	f
https://www.google.com/calendar/event?eid=MDZvbWhhOXUzNjU0YjU4ZjZnbjV2cWlsdWwgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4193	2025-01-25 20:00:00	20	Lost Evidence	2025-01-04 18:25:50.844588	2025-01-04 18:25:50.844588	f
https://www.google.com/calendar/event?eid=NmgwcGdsNGdyOXBvY3RwczlscjdhN2FvYjBfMjAyNTAxMjZUMjAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4194	2025-01-26 14:30:00	20	Johnny No Cash	2025-01-04 18:25:50.844938	2025-01-04 18:25:50.844938	f
https://www.google.com/calendar/event?eid=NWhhb21tOGdzZnVkZ2Y4dGNyY2Y2azFhZTJfMjAyNTAxMjhUMDEzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4195	2025-01-27 19:30:00	20	World Music Monday hosted by Other Country Ensemble	2025-01-04 18:25:50.845265	2025-01-04 18:25:50.845265	f
https://www.google.com/calendar/event?eid=N2VzMThna2EyamJtN2w1YzYwYjVvMGlkMnMgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4196	2025-01-31 19:00:00	20	Twin Cities 7	2025-01-04 18:25:50.845621	2025-01-04 18:25:50.845621	f
https://www.google.com/calendar/event?eid=N29uZGUycG8ydGFvcWYycGIwZW5qcGEwaWpfMjAyNTAyMDFUMTczMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4197	2025-02-01 11:30:00	20	Post 1 Legion	2025-01-04 18:25:50.845973	2025-01-04 18:25:50.845973	f
https://www.google.com/calendar/event?eid=N3Yycm5jZjFuajlwaGdwM3BjdGxqMjFjN3FfMjAyNTAyMDJUMjAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4198	2025-02-02 14:30:00	20	Country Doctors	2025-01-04 18:25:50.84642	2025-01-04 18:25:50.84642	f
https://www.google.com/calendar/event?eid=N25vbGhwajgwa2hwZDdtN3BoaXRzNmsxMHFfMjAyNTAyMDRUMDEwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4199	2025-02-03 19:00:00	20	Steve Clarke 'n' Band	2025-01-04 18:25:50.846811	2025-01-04 18:25:50.846811	f
https://www.google.com/calendar/event?eid=Mmo0aTZyaWxjazJvZ2hwMDh0cGdrZzMwa3FfMjAyNTAyMDhUMTkwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4200	2025-02-08 13:00:00	20	Secret Drawing Club	2025-01-04 18:25:50.847195	2025-01-04 18:25:50.847195	f
https://www.google.com/calendar/event?eid=Nmk3Z2JjOGtpZTJxN3BtdWU2dWJwbmNtaTggdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4201	2025-02-08 20:00:00	20	Night of Joy	2025-01-04 18:25:50.847584	2025-01-04 18:25:50.847584	f
https://www.google.com/calendar/event?eid=MnFwbGk5cGZocm5yNmwxaDlyZ3ZwcXF1cGkgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4202	2025-02-16 14:30:00	20	TC Ramblers	2025-01-04 18:25:50.847949	2025-01-04 18:25:50.847949	f
https://www.google.com/calendar/event?eid=MzI1NjdwMmFpYjFyMjQ4bzUxa3NraDJsMGpfMjAyNTAyMThUMTUwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4203	2025-02-18 09:00:00	20	MRTI	2025-01-04 18:25:50.848324	2025-01-04 18:25:50.848324	f
https://first-avenue.com/event/2025-01-will-burkart/	https://first-avenue.com/wp-content/uploads/2024/08/WillBurkart-011125-1080.jpg	4511	2025-01-11 20:00:00	16	Will Burkart	2025-01-04 18:28:52.683303	2025-01-04 18:28:52.683303	f
https://first-avenue.com/event/2025-02-ready-or-hot/	https://first-avenue.com/wp-content/uploads/2025/01/ROH25-022025_1080v1.jpg	4602	2025-02-20 19:00:00	8	Ready or Hot, DJ Tricky Miki	2025-01-04 18:30:28.100925	2025-01-04 18:30:28.100925	f
https://first-avenue.com/event/2025-03-jesse-welles/	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/30cfa01e-4544-4f7d-9e20-21f358bf339a/JesseWelles-1080x1080+update.jpg	3988	2025-03-01 20:00:00	16	Jesse Welles	2025-01-04 17:37:13.481191	2025-01-04 17:37:13.481191	f
https://www.greenroommn.com#/events/126661	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_47834429dbb50d0dfd7eeb4318a817e132d8a6f93eaecee14eec6aa433ce3f2d.png	1496	2025-01-05 22:00:00	22	Synastry Sundays, Every Sunday Night starting at 10	2024-12-30 13:46:43.702891	2024-12-30 13:46:43.702891	f
https://www.google.com/calendar/event?eid=NmgwcGdsNGdyOXBvY3RwczlscjdhN2FvYjBfMjAyNTAyMjNUMjAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4205	2025-02-23 14:30:00	20	Johnny No Cash	2025-01-04 18:25:50.85298	2025-01-04 18:25:50.85298	f
https://www.google.com/calendar/event?eid=NWhhb21tOGdzZnVkZ2Y4dGNyY2Y2azFhZTJfMjAyNTAyMjVUMDEzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4206	2025-02-24 19:30:00	20	World Music Monday hosted by Other Country Ensemble	2025-01-04 18:25:50.853742	2025-01-04 18:25:50.853742	f
https://www.google.com/calendar/event?eid=N29uZGUycG8ydGFvcWYycGIwZW5qcGEwaWpfMjAyNTAzMDFUMTczMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4207	2025-03-01 11:30:00	20	Post 1 Legion	2025-01-04 18:25:50.854242	2025-01-04 18:25:50.854242	f
https://www.google.com/calendar/event?eid=N3Yycm5jZjFuajlwaGdwM3BjdGxqMjFjN3FfMjAyNTAzMDJUMjAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4208	2025-03-02 14:30:00	20	Country Doctors	2025-01-04 18:25:50.854719	2025-01-04 18:25:50.854719	f
https://www.google.com/calendar/event?eid=N25vbGhwajgwa2hwZDdtN3BoaXRzNmsxMHFfMjAyNTAzMDRUMDEwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4209	2025-03-03 19:00:00	20	Steve Clarke 'n' Band	2025-01-04 18:25:50.855237	2025-01-04 18:25:50.855237	f
https://www.google.com/calendar/event?eid=NG1jY2dmNmlvZWoxODJta2xmZm5rYmQ2dGkgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4210	2025-03-07 19:00:00	20	Katia & The Upswing	2025-01-04 18:25:50.855722	2025-01-04 18:25:50.855722	f
https://www.google.com/calendar/event?eid=Mmo0aTZyaWxjazJvZ2hwMDh0cGdrZzMwa3FfMjAyNTAzMDhUMTkwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4211	2025-03-08 13:00:00	20	Secret Drawing Club	2025-01-04 18:25:50.856244	2025-01-04 18:25:50.856244	f
https://www.google.com/calendar/event?eid=NjE2ZWpucDQ0bTlvMnVjMGVsN2VwMXUwZ2YgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4212	2025-03-09 14:30:00	20	Robinson Roundup	2025-01-04 18:25:50.856716	2025-01-04 18:25:50.856716	f
https://www.google.com/calendar/event?eid=c2dzbHFoamo1OGoyaWl1aXBvMnVodWI2cmhfMjAyNTAzMTVUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4213	2025-03-14 19:00:00	20	Sheli Stein and the Purim Players Present Purim 5785	2025-01-04 18:25:50.857129	2025-01-04 18:25:50.857129	f
https://www.google.com/calendar/event?eid=Nm9zMzRjcjVjb28zY2I5cDZkaG00YjlrY2tvMzJiOW82OHAzZWI5ajZjcm04b2hpNjFpajhjMWw2ayB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4214	2025-03-15 13:00:00	20	State Officers Planning	2025-01-04 18:25:50.857506	2025-01-04 18:25:50.857506	f
https://www.google.com/calendar/event?eid=M2ZwYjlicm43ZTduYzRxMHZvZ2NmODd0dDQgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4215	2025-03-16 14:30:00	20	Tailspin	2025-01-04 18:25:50.858348	2025-01-04 18:25:50.858348	f
https://www.google.com/calendar/event?eid=MzI1NjdwMmFpYjFyMjQ4bzUxa3NraDJsMGpfMjAyNTAzMThUMTQwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4216	2025-03-18 09:00:00	20	MRTI	2025-01-04 18:25:50.858883	2025-01-04 18:25:50.858883	f
https://www.google.com/calendar/event?eid=MmI2dDQyZGg5YWYxdmszNjByYXBhZnI4MHVfMjAyNTAzMjBUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4217	2025-03-19 19:00:00	20	Ton Up Mpls	2025-01-04 18:25:50.859676	2025-01-04 18:25:50.859676	f
https://www.google.com/calendar/event?eid=NmgwcGdsNGdyOXBvY3RwczlscjdhN2FvYjBfMjAyNTAzMjNUMTkzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4218	2025-03-23 14:30:00	20	Johnny No Cash	2025-01-04 18:25:50.860066	2025-01-04 18:25:50.860066	f
https://www.google.com/calendar/event?eid=NWhhb21tOGdzZnVkZ2Y4dGNyY2Y2azFhZTJfMjAyNTAzMjVUMDAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4219	2025-03-24 19:30:00	20	World Music Monday hosted by Other Country Ensemble	2025-01-04 18:25:50.860474	2025-01-04 18:25:50.860474	f
https://www.google.com/calendar/event?eid=MzM2bGNqMjR2MWY1M2Zxb2VvcWQ0dTA0dGEgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4220	2025-03-30 14:30:00	20	TC Ramblers	2025-01-04 18:25:50.860827	2025-01-04 18:25:50.860827	f
https://www.google.com/calendar/event?eid=NHFlNGVtcDVtbWVpcTRlMnNpcTBsajNkYzggdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4221	2025-04-04 20:00:00	20	 Will Orchard, Spaceport, CB	2025-01-04 18:25:50.861174	2025-01-04 18:25:50.861174	f
https://www.google.com/calendar/event?eid=N29uZGUycG8ydGFvcWYycGIwZW5qcGEwaWpfMjAyNTA0MDVUMTYzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4222	2025-04-05 11:30:00	20	Post 1 Legion	2025-01-04 18:25:50.861529	2025-01-04 18:25:50.861529	f
https://www.google.com/calendar/event?eid=N3Yycm5jZjFuajlwaGdwM3BjdGxqMjFjN3FfMjAyNTA0MDZUMTkzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4223	2025-04-06 14:30:00	20	Country Doctors	2025-01-04 18:25:50.861894	2025-01-04 18:25:50.861894	f
https://www.google.com/calendar/event?eid=N25vbGhwajgwa2hwZDdtN3BoaXRzNmsxMHFfMjAyNTA0MDhUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4224	2025-04-07 19:00:00	20	Steve Clarke 'n' Band	2025-01-04 18:25:50.862269	2025-01-04 18:25:50.862269	f
https://www.google.com/calendar/event?eid=M2c2dTJ2c21sMHFpOXVyaXFhNm8wMHFnZTIgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4225	2025-04-09 17:00:00	20	Rainbow Bowling Banquet	2025-01-04 18:25:50.862644	2025-01-04 18:25:50.862644	f
https://www.google.com/calendar/event?eid=Mmo0aTZyaWxjazJvZ2hwMDh0cGdrZzMwa3FfMjAyNTA0MTJUMTgwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4226	2025-04-12 13:00:00	20	Secret Drawing Club	2025-01-04 18:25:50.863021	2025-01-04 18:25:50.863021	f
https://www.google.com/calendar/event?eid=MzI1NjdwMmFpYjFyMjQ4bzUxa3NraDJsMGpfMjAyNTA0MTVUMTQwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4227	2025-04-15 09:00:00	20	MRTI	2025-01-04 18:25:50.863415	2025-01-04 18:25:50.863415	f
https://www.google.com/calendar/event?eid=MmI2dDQyZGg5YWYxdmszNjByYXBhZnI4MHVfMjAyNTA0MTdUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4228	2025-04-16 19:00:00	20	Ton Up Mpls	2025-01-04 18:25:50.863785	2025-01-04 18:25:50.863785	f
https://www.google.com/calendar/event?eid=NHFsbjlwb2NsNGpyYjRuMW02OGM3bmZvamIgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4229	2025-04-20 14:30:00	20	TC Ramblers	2025-01-04 18:25:50.864224	2025-01-04 18:25:50.864224	f
https://www.google.com/calendar/event?eid=MmI2dDQyZGg5YWYxdmszNjByYXBhZnI4MHVfMjAyNTAyMjBUMDEwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4204	2025-02-19 19:00:00	20	Ton Up Mpls	2025-01-04 18:25:50.848669	2025-01-04 18:25:50.848669	f
https://www.google.com/calendar/event?eid=NmgwcGdsNGdyOXBvY3RwczlscjdhN2FvYjBfMjAyNTA0MjdUMTkzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4230	2025-04-27 14:30:00	20	Johnny No Cash	2025-01-04 18:25:50.864601	2025-01-04 18:25:50.864601	f
https://www.google.com/calendar/event?eid=NWhhb21tOGdzZnVkZ2Y4dGNyY2Y2azFhZTJfMjAyNTA0MjlUMDAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4231	2025-04-28 19:30:00	20	World Music Monday hosted by Other Country Ensemble	2025-01-04 18:25:50.865544	2025-01-04 18:25:50.865544	f
https://www.google.com/calendar/event?eid=N29zMWozYXVyNmRwOWo3MW0wcXZvbmwwNjEgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4232	2025-05-02 19:00:00	20	Katia & The Upswing	2025-01-04 18:25:50.866022	2025-01-04 18:25:50.866022	f
https://www.google.com/calendar/event?eid=N29uZGUycG8ydGFvcWYycGIwZW5qcGEwaWpfMjAyNTA1MDNUMTYzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4233	2025-05-03 11:30:00	20	Post 1 Legion	2025-01-04 18:25:50.866597	2025-01-04 18:25:50.866597	f
https://www.google.com/calendar/event?eid=N3Yycm5jZjFuajlwaGdwM3BjdGxqMjFjN3FfMjAyNTA1MDRUMTkzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4234	2025-05-04 14:30:00	20	Country Doctors	2025-01-04 18:25:50.86697	2025-01-04 18:25:50.86697	f
https://www.google.com/calendar/event?eid=N25vbGhwajgwa2hwZDdtN3BoaXRzNmsxMHFfMjAyNTA1MDZUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4235	2025-05-05 19:00:00	20	Steve Clarke 'n' Band	2025-01-04 18:25:50.867492	2025-01-04 18:25:50.867492	f
https://www.google.com/calendar/event?eid=Mmo0aTZyaWxjazJvZ2hwMDh0cGdrZzMwa3FfMjAyNTA1MTBUMTgwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4236	2025-05-10 13:00:00	20	Secret Drawing Club	2025-01-04 18:25:50.86794	2025-01-04 18:25:50.86794	f
https://www.google.com/calendar/event?eid=Nm9zbTV0YXNzaWlqcmFmZnY2MTRxZnVuOTMgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4237	2025-05-11 14:30:00	20	Robinson Roundup	2025-01-04 18:25:50.868322	2025-01-04 18:25:50.868322	f
https://www.google.com/calendar/event?eid=NDF1bGM4bDB1OHRtc2IzdjIxNWthbDNpdDYgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4238	2025-05-18 14:30:00	20	Tailspin	2025-01-04 18:25:50.868718	2025-01-04 18:25:50.868718	f
https://www.google.com/calendar/event?eid=MzI1NjdwMmFpYjFyMjQ4bzUxa3NraDJsMGpfMjAyNTA1MjBUMTQwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4239	2025-05-20 09:00:00	20	MRTI	2025-01-04 18:25:50.869143	2025-01-04 18:25:50.869143	f
https://www.google.com/calendar/event?eid=MmI2dDQyZGg5YWYxdmszNjByYXBhZnI4MHVfMjAyNTA1MjJUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4240	2025-05-21 19:00:00	20	Ton Up Mpls	2025-01-04 18:25:50.869547	2025-01-04 18:25:50.869547	f
https://www.google.com/calendar/event?eid=NmgwcGdsNGdyOXBvY3RwczlscjdhN2FvYjBfMjAyNTA1MjVUMTkzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4241	2025-05-25 14:30:00	20	Johnny No Cash	2025-01-04 18:25:50.869951	2025-01-04 18:25:50.869951	f
https://www.google.com/calendar/event?eid=NWhhb21tOGdzZnVkZ2Y4dGNyY2Y2azFhZTJfMjAyNTA1MjdUMDAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4242	2025-05-26 19:30:00	20	World Music Monday hosted by Other Country Ensemble	2025-01-04 18:25:50.870388	2025-01-04 18:25:50.870388	f
https://www.google.com/calendar/event?eid=N3Yycm5jZjFuajlwaGdwM3BjdGxqMjFjN3FfMjAyNTA2MDFUMTkzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4243	2025-06-01 14:30:00	20	Country Doctors	2025-01-04 18:25:50.870791	2025-01-04 18:25:50.870791	f
https://www.google.com/calendar/event?eid=N25vbGhwajgwa2hwZDdtN3BoaXRzNmsxMHFfMjAyNTA2MDNUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4244	2025-06-02 19:00:00	20	Steve Clarke 'n' Band	2025-01-04 18:25:50.87167	2025-01-04 18:25:50.87167	f
https://www.google.com/calendar/event?eid=N29uZGUycG8ydGFvcWYycGIwZW5qcGEwaWpfMjAyNTA2MDdUMTYzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4245	2025-06-07 11:30:00	20	Post 1 Legion	2025-01-04 18:25:50.872083	2025-01-04 18:25:50.872083	f
https://www.google.com/calendar/event?eid=Mmo0aTZyaWxjazJvZ2hwMDh0cGdrZzMwa3FfMjAyNTA2MTRUMTgwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4246	2025-06-14 13:00:00	20	Secret Drawing Club	2025-01-04 18:25:50.87249	2025-01-04 18:25:50.87249	f
https://www.google.com/calendar/event?eid=N3FwNzR0YWM4cjl2OWtrNDY4dWhncmd0NjQgdGVmbGd1dGVsbGx2bGE3cjZ2ZmNtamRqam9AZw	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4247	2025-06-15 14:30:00	20	TC Ramblers	2025-01-04 18:25:50.872902	2025-01-04 18:25:50.872902	f
https://www.google.com/calendar/event?eid=MzI1NjdwMmFpYjFyMjQ4bzUxa3NraDJsMGpfMjAyNTA2MTdUMTQwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4248	2025-06-17 09:00:00	20	MRTI	2025-01-04 18:25:50.87332	2025-01-04 18:25:50.87332	f
https://www.google.com/calendar/event?eid=MmI2dDQyZGg5YWYxdmszNjByYXBhZnI4MHVfMjAyNTA2MTlUMDAwMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4249	2025-06-18 19:00:00	20	Ton Up Mpls	2025-01-04 18:25:50.87371	2025-01-04 18:25:50.87371	f
https://www.google.com/calendar/event?eid=NmgwcGdsNGdyOXBvY3RwczlscjdhN2FvYjBfMjAyNTA2MjJUMTkzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4250	2025-06-22 14:30:00	20	Johnny No Cash	2025-01-04 18:25:50.874118	2025-01-04 18:25:50.874118	f
https://www.google.com/calendar/event?eid=NWhhb21tOGdzZnVkZ2Y4dGNyY2Y2azFhZTJfMjAyNTA2MjRUMDAzMDAwWiB0ZWZsZ3V0ZWxsbHZsYTdyNnZmY21qZGpqb0Bn	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	4251	2025-06-23 19:30:00	20	World Music Monday hosted by Other Country Ensemble	2025-01-04 18:25:50.874543	2025-01-04 18:25:50.874543	f
https://first-avenue.com/event/2024-12-history-that-doesnt-suck/	https://images.squarespace-cdn.com/content/v1/64c8a76bf0d7e24b819a4d4e/a31020f8-5ce2-42ec-b3a6-cef71c4de78e/HistoryDoesntSuck-1080x1080+%282%29.jpg	4000	2024-12-13 20:00:00	16	History That Doesn't Suck with Professor Greg Jackson	2025-01-04 17:37:13.507805	2025-01-04 17:37:13.507805	f
https://first-avenue.com/event/2024-12-michael-kosta/	https://first-avenue.com/wp-content/uploads/2024/04/MichaelKosta-122124-1080.jpg	4390	2024-12-21 20:00:00	16	Michael Kosta, Aidan McCluskey	2025-01-04 18:27:46.190592	2025-01-04 18:27:46.190592	f
https://www.greenroommn.com#/events/126870	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a727e5f173a2a6988b0126ac1d5c2075298ee187f749f71090ee1178b753dec3.png	4789	2025-01-04 21:00:00	22	Radio Moon Residency Parties, A WEEKEND DANCE RESIDENCY IN JANUARY	2025-01-04 18:53:21.989754	2025-01-04 18:53:21.989754	f
https://www.greenroommn.com#/events/126871	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a727e5f173a2a6988b0126ac1d5c2075298ee187f749f71090ee1178b753dec3.png	4794	2025-01-10 21:00:00	22	Radio Moon Residency Parties, A WEEKEND DANCE RESIDENCY IN JANUARY	2025-01-04 18:53:22.064613	2025-01-04 18:53:22.064613	f
https://www.greenroommn.com#/events/126872	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a727e5f173a2a6988b0126ac1d5c2075298ee187f749f71090ee1178b753dec3.png	4798	2025-01-17 21:00:00	22	Radio Moon Residency Parties, A WEEKEND DANCE RESIDENCY IN JANUARY	2025-01-04 18:53:22.072179	2025-01-04 18:53:22.072179	f
https://www.greenroommn.com#/events/125731	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_7b71d5d6adcf7a94b6c56e08b7b95bb596f0fee490a930de9a1752f30cc66d82.png	4799	2025-01-18 19:00:00	22	ADA ROOK, Anita Velveeta, snakeworld!	2025-01-04 18:53:22.073761	2025-01-04 18:53:22.073761	f
https://www.greenroommn.com#/events/126873	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a727e5f173a2a6988b0126ac1d5c2075298ee187f749f71090ee1178b753dec3.png	4803	2025-01-24 21:00:00	22	Radio Moon Residency Parties, A WEEKEND DANCE RESIDENCY IN JANUARY	2025-01-04 18:53:22.085107	2025-01-04 18:53:22.085107	f
https://www.greenroommn.com#/events/122226	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a799ac06297b62850a13d388f6bd43984a29c3e536a9d18f25fa497a200802a9.png	476	2025-01-31 19:00:00	22	2 Year Anniversary - NIGHT 1 - The Shackletons, Megasound, Dark Pony, Katacombs, The Shackletons, Megasound, Dark Pony, Katacombs	2024-12-22 21:18:23.271142	2024-12-22 21:18:23.271142	f
https://icehouse.turntabletickets.com/shows/5597/?date=2025-01-10	https://assets-prod.turntabletickets.com/media/icehouse/show-5597/spin_the_classic_MArk_McGee.jpg	4837	2025-01-10 19:00:00	34	MAKR Presents the THE COLLECTION - An all Vinyl Night	2025-01-04 18:54:08.74395	2025-01-04 18:54:08.74395	f
https://icehouse.turntabletickets.com/shows/5593/?date=2025-01-11	https://assets-prod.turntabletickets.com/media/icehouse/show-5593/Thornton_BowlHeadshot2_(1).jpg	4839	2025-01-11 19:00:00	34	Starlight Vinyl Night Featuring Katie Thornton	2025-01-04 18:54:08.746188	2025-01-04 18:54:08.746188	f
https://icehouse.turntabletickets.com/shows/5588/?date=2025-01-19	https://assets-prod.turntabletickets.com/media/icehouse/show-5588/thumbnail_IMG_3652.jpg	4845	2025-01-19 17:00:00	34	Twin Cities Flamenco Collective, Juan Pedro Jiménez, La Bárbara	2025-01-04 18:54:08.754797	2025-01-04 18:54:08.754797	f
https://icehouse.turntabletickets.com/shows/5590/?date=2025-01-29	https://assets-prod.turntabletickets.com/media/icehouse/show-5590/regional_8pm.jpeg	4850	2025-01-29 18:00:00	34	Regional Jazz Trio - Anthony Cox, JT Bates, Mike Lewis	2025-01-04 18:54:08.760206	2025-01-04 18:54:08.760206	f
https://www.mortimerscalendar.com/event-details-registration/weekend-autotune-kareoke-w-dimitry-killstorm	https://static.wixstatic.com/media/cd839d_bf167401f59e4c5fb103d864af9b020c~mv2.jpeg	4880	2025-01-04 22:00:00	36	WEEKEND  AUTOTUNE KAREOKE, DIMITRY KILLSTORM	2025-01-04 18:54:33.5147	2025-01-04 18:54:33.5147	f
https://icehouse.turntabletickets.com/shows/5585/?date=2025-01-08	https://assets-prod.turntabletickets.com/media/icehouse/show-5585/Copy_of_ANNOUNCE_(sqaure)_(11_x_17_in).png.jpg	4836	2025-01-08 18:00:00	34	Alpha Consumer	2025-01-04 18:54:08.741884	2025-01-04 18:54:08.741884	f
https://palmers-bar.com/calendar/2025/1/3/capricorn-bash-and-winter-clothing-drive-with-tufawon-bigg-kia-mixie-mike-queenz-sole2dotz-and-gonkama	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/ad109279-fc94-47c8-a994-c476b857e971/Capricorn+Bash.jpeg	4885	2025-01-03 20:00:00	37	'Capricorn Bash and Winter Clothing Drive!' With Tufawon, Bigg Kia, Mixie, Mike Queenz, Sole2Dotz and Hosted by Gonkama!	2025-01-04 18:57:29.00119	2025-01-04 18:57:29.00119	f
https://palmers-bar.com/calendar/2025/1/4/valors-constant-insult-and-true-lust	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/dfc0b124-3efa-4256-a577-072aae809550/Valors+1%3A4.jpeg	4886	2025-01-04 20:00:00	37	Valors, Constant Insult and True Lust	2025-01-04 18:57:29.003311	2025-01-04 18:57:29.003311	f
https://palmers-bar.com/calendar/2024/8/11/west-bank-social-club-dk6ce-6r5bx-5hr2l-bzlpc-8k32b-8mbfn-4f9gl-bc84s-by82z-cjc5n-h8n7r-49jaa-pyekc-7dpsg-3hfpl-8ypmy-xtarb-zmkry-b6rh5-r9xrs	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/db036898-de3b-485b-a976-26903758e7ad/westbanksocialshotglass.jpeg	4888	2025-01-05 20:00:00	37	West Bank Social Club	2025-01-04 18:57:29.005791	2025-01-04 18:57:29.005791	f
https://palmers-bar.com/calendar/akj6wxakwy9hmg4-59dj3-kgmj8-hj3cj-ndlaf-w468n	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/c8a7387a-40bd-42bf-aa15-0bfe902f5e70/photo1+2.jpg	4889	2025-01-06 20:00:00	37	COWAOKE with BEN MOOOKER	2025-01-04 18:57:29.006968	2025-01-04 18:57:29.006968	f
https://palmers-bar.com/calendar/2024/6/12/better-mistakes-2nd-wednesdays-monthly-free-t3ngm-nb95k-thnxd-n3awc-364ap-l9f6h-jtbdb-e57pf	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/f7ef2069-27a1-4da0-a780-6d506c6c106f/Better+Mistakes+poster.png	4891	2025-01-08 20:00:00	37	Better Mistakes "2nd Wednesdays Monthly" FREE!	2025-01-04 18:57:29.00832	2025-01-04 18:57:29.00832	f
https://palmers-bar.com/calendar/cyrnl3ag6tz8kcp-j7ft9-8aekc-5xtj5-e834a-rlpt6-jgr98-6fzck-bnc63-9mt6f	\N	4892	2025-01-09 19:00:00	37	The Front Porch Swingin’ Liquor Pigs	2025-01-04 18:57:29.009126	2025-01-04 18:57:29.009126	f
https://palmers-bar.com/calendar/2025/1/10/mary-jam-and-friends	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/4a681fe4-3c59-4e6b-a86a-23cb5a3f948e/MaryJam1_10.jpeg	4893	2025-01-10 20:00:00	37	Mary Jam, Lydia, Bird Cop and Thirsty Giants	2025-01-04 18:57:29.009919	2025-01-04 18:57:29.009919	f
https://palmers-bar.com/calendar/yy32d7yle7sdf3r-adfs8-37eps-wwfn8-cm7a9-mdekz-c3f99-5hm8f-xnd9b	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/16c5580c-7d6a-4fab-8ba0-5cd9b2e314df/Cornbread.jpeg	4895	2025-01-12 17:00:00	37	'Church of Cornbread!' Cornbread Harris and his band!	2025-01-04 18:57:29.011269	2025-01-04 18:57:29.011269	f
https://palmers-bar.com/calendar/2024/10/8/zen-open-jam-2nd-tuesdays-monthly-free-9b8zl-6pe9b-mxp7z	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/39cb2efd-9b4f-4d05-8451-a6e21213af43/zen+open+jam+ruby.jpeg	4897	2025-01-14 20:00:00	37	'Zen Open Jam' 2nd Tuesdays Monthly FREE!	2025-01-04 18:57:29.012809	2025-01-04 18:57:29.012809	f
https://palmers-bar.com/calendar/2024/1/17/cole-diamond-presents-whiskey-wednesdays-3rd-wednesdays-monthly-free-z7hd9-h6kk8-2c6dc-xgjsd-tam77-938tk-hn7jy-amayt-y3343-znpmy-s4d9x-b64gj	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/7a045602-e22a-4277-907b-68fbd50449dc/ColeDiamondWhiskeyWednesday.jpeg	4898	2025-01-15 20:00:00	37	Cole Diamond Presents~ "Whiskey Wednesdays!" 3rd Wednesdays Monthly FREE!	2025-01-04 18:57:29.013376	2025-01-04 18:57:29.013376	f
https://palmers-bar.com/calendar/tjew3gh4prexz9m-ygdhx-tedm8-8ra55-6wd4t	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/d732ef0d-24b7-475e-ac4b-e6e6ea699baf/Riddim%27+Driven.jpeg	4899	2025-01-16 20:00:00	37	'Riddim Driven' with DJ I Roach and Friends!  (roots raggae, dub, ska) 3rd Thursdays FREE	2025-01-04 18:57:29.013887	2025-01-04 18:57:29.013887	f
https://palmers-bar.com/calendar/2025/1/18/the-reckoning-crew-rem-tribute-monsters-in-the-parasol-qotsa-tribute-and-cretin-avenue-hop-ramones	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/bae583c2-9214-4d54-bff0-20c00b9851ac/DeepFreezePalmers_square.jpeg	4901	2025-01-18 20:00:00	37	DEEPFREEZE TRIBUTE BASH! W/The Reckoning Crew (REM Tribute), Monsters In the Parasol (QOTSA Tribute) and Cretin Avenue Hop (Ramones)	2025-01-04 18:57:29.015434	2025-01-04 18:57:29.015434	f
https://palmers-bar.com/calendar/2023/10/17/new-band-night-and-2-4-1s-every-third-tuesday-monthly-8pm-midnight-9kged-lpnyd-3tldd-fbrka-9x9tp-sd5e2-9rwpg-c5etl-rgmmj-ca8z9-n28ft-5fjm3-ggp2l-3274r-9mnm4	\N	4905	\N	37	New Band Night!  Third Tuesday's Monthly 8pm-12am $5	2025-01-04 18:57:29.019163	2025-01-04 18:57:29.019163	f
https://palmers-bar.com/calendar/2023/10/17/new-band-night-and-2-4-1s-every-third-tuesday-monthly-8pm-midnight-9kged-lpnyd-3tldd-fbrka-9x9tp-sd5e2-9rwpg-c5etl-rgmmj-ca8z9-n28ft-5fjm3-ggp2l-3274r-9mnm4	\N	4906	\N	37	New Band Night!  Third Tuesday's Monthly 8pm-12am $5	2025-01-04 18:57:29.020307	2025-01-04 18:57:29.020307	f
https://palmers-bar.com/calendar/2022/12/1/dj-don-greene-aka-greenery-1st-thursdays-monthly-free-tmxxj-5xawz-m978h-es9xw-b9pkz-mn8rn-gydjl-x6c3x-lhxgg-agh2g-ydzt7-al2dp-cx72h-7ghna-5xzk9-x27ks-d6bda-4yzn9-bwsrj-mx53n-t4ypg-4wmf3	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/9a27eee8-82fe-4255-8f18-1ad923829ba7/bootsyballin.jpeg	4884	2025-01-02 20:00:00	37	Throwback Thursdays with DJ Bootsy Ballins!  (1st Thursdays monthly) FREE!  8pm-Midnight	2025-01-04 18:57:28.994781	2025-01-04 18:57:28.994781	f
https://palmers-bar.com/calendar/yy32d7yle7sdf3r-adfs8-37eps-wwfn8-cm7a9-mdekz-c3f99-5hm8f	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/16c5580c-7d6a-4fab-8ba0-5cd9b2e314df/Cornbread.jpeg	4887	2025-01-05 17:00:00	37	'Church of Cornbread!' Cornbread Harris and his band!                                                                                                                                             (Copy)	2025-01-04 18:57:29.004925	2025-01-04 18:57:29.004925	f
https://palmers-bar.com/calendar/2025/1/11/lokis-folly-mary-strand-and-tba	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/0dd80030-26c2-4105-bd6f-a9fbb0f6986e/Mary+Strand+1-11-25+FINAL.jpg	4894	2025-01-11 20:00:00	37	Mary Strand and The Garage, Loki's Folly, Brynn Arens (FLIPP) and A Sunken Ship Irony.	2025-01-04 18:57:29.010575	2025-01-04 18:57:29.010575	f
https://palmers-bar.com/calendar/2024/8/11/west-bank-social-club-dk6ce-6r5bx-5hr2l-bzlpc-8k32b-8mbfn-4f9gl-bc84s-by82z-cjc5n-h8n7r-49jaa-pyekc-7dpsg-3hfpl-8ypmy-xtarb-zmkry-b6rh5-r9xrs-drk54	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/db036898-de3b-485b-a976-26903758e7ad/westbanksocialshotglass.jpeg	4896	2025-01-12 20:00:00	37	West Bank Social Club	2025-01-04 18:57:29.012119	2025-01-04 18:57:29.012119	f
https://palmers-bar.com/calendar/2025/1/17/bridge-band-the-better-mistakes-and-colonel-mustards-mechanical-orchestra	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/581797d2-e78d-40c3-90b9-544b8244ccfa/better+mistakes+1%3A17.png	4900	2025-01-17 20:00:00	37	Bridge Band, The Better Mistakes and Colonel Mustards Mechanical Orchestra $5	2025-01-04 18:57:29.014629	2025-01-04 18:57:29.014629	f
https://palmers-bar.com/calendar/yy32d7yle7sdf3r-adfs8-37eps-wwfn8-cm7a9-mdekz-c3f99-5hm8f-xnd9b-h9fzb	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/16c5580c-7d6a-4fab-8ba0-5cd9b2e314df/Cornbread.jpeg	4902	2025-01-19 17:00:00	37	'Church of Cornbread!' Cornbread Harris and his band!	2025-01-04 18:57:29.016284	2025-01-04 18:57:29.016284	f
https://palmers-bar.com/calendar/2024/8/11/west-bank-social-club-dk6ce-6r5bx-5hr2l-bzlpc-8k32b-8mbfn-4f9gl-bc84s-by82z-cjc5n-h8n7r-49jaa-pyekc-7dpsg-3hfpl-8ypmy-xtarb-zmkry-b6rh5-r9xrs-drk54-gfsrp	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/db036898-de3b-485b-a976-26903758e7ad/westbanksocialshotglass.jpeg	4903	2025-01-19 20:00:00	37	West Bank Social Club	2025-01-04 18:57:29.017603	2025-01-04 18:57:29.017603	f
https://palmers-bar.com/calendar/2023/10/17/new-band-night-and-2-4-1s-every-third-tuesday-monthly-8pm-midnight-9kged-lpnyd-3tldd-fbrka-9x9tp-sd5e2-9rwpg-c5etl-rgmmj-ca8z9-n28ft-5fjm3-ggp2l-3274r-9mnm4	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/1e756efc-b843-4caa-bef6-3b420a38dc1f/Noah+Schmitt.png	4939	\N	37	New Band Night!  Third Tuesday's Monthly 8pm-12am $5	2025-01-04 19:05:00.941912	2025-01-04 19:05:00.941912	f
https://palmers-bar.com/calendar/2023/10/17/new-band-night-and-2-4-1s-every-third-tuesday-monthly-8pm-midnight-9kged-lpnyd-3tldd-fbrka-9x9tp-sd5e2-9rwpg-c5etl-rgmmj-ca8z9-n28ft-5fjm3-ggp2l-3274r-9mnm4	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/1e756efc-b843-4caa-bef6-3b420a38dc1f/Noah+Schmitt.png	4940	\N	37	New Band Night!  Third Tuesday's Monthly 8pm-12am $5	2025-01-04 19:05:00.955063	2025-01-04 19:05:00.955063	f
https://palmers-bar.com/calendar/2024/6/26/the-matt-arthur-contraption-4th-wedensdays-monthly-free-5x66d-a6pgl-5wfha-rbcl7-84j6j-zaknf-29xwr	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/1725587784492-2B8DKA1CWID9YTBBHD94/MattArthurRes.jpeg	4907	2025-01-22 20:00:00	37	The Matt Arthur Contraption '4th Wednesdays Monthly' FREE!	2025-01-04 18:57:29.021138	2025-01-04 18:57:29.021138	f
https://palmers-bar.com/calendar/2025/1/23/fragged-out-rooin-sons-of-bliss-kvsket-non-and-j-row	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/dff47f41-b6a1-45e9-910f-0a5e590093a4/Fragged+Out.jpg	4908	2025-01-23 20:00:00	37	Fragged Out, Rooin', Sons of Bliss, KVSKET, Non and J Row	2025-01-04 18:57:29.021749	2025-01-04 18:57:29.021749	f
https://palmers-bar.com/calendar/2025/1/24/unattractive-giant-monster-and-friends	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/bdb1b96d-7ff8-464b-86f6-2f0593405a9b/UGM+1%3A24.jpeg	4909	2025-01-24 20:00:00	37	Unattractive Giant Monster, The Silent Treatment and Dashed	2025-01-04 18:57:29.022263	2025-01-04 18:57:29.022263	f
https://palmers-bar.com/calendar/yy32d7yle7sdf3r-adfs8-37eps-wwfn8-cm7a9-mdekz-c3f99-5hm8f-xnd9b-h9fzb-52cgf	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/16c5580c-7d6a-4fab-8ba0-5cd9b2e314df/Cornbread.jpeg	4911	2025-01-26 17:00:00	37	'Church of Cornbread!' Cornbread Harris and his band!	2025-01-04 18:57:29.023496	2025-01-04 18:57:29.023496	f
https://palmers-bar.com/calendar/2024/10/1/funky-fourth-mondays-monthly-with-the-th3-wx26d-ew6e6	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/a53e9126-a81a-47af-8494-884a0193f7b2/TheTh3small.jpeg	4913	2025-01-27 19:00:00	37	Funky Fourth Mondays Monthly with The TH3!	2025-01-04 18:57:29.024565	2025-01-04 18:57:29.024565	f
https://palmers-bar.com/calendar/2024/10/22/minniax-presents-ragefuture-open-mic-4th-tuesdays-monthly-xzzwp-wh9ml-88jlp	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/00360c6a-1a3e-469e-9e5f-5c3b815219c4/Ragefuture+Open+MIc+Flyer.jpeg	4914	2025-01-28 20:00:00	37	Minniax Presents~ RAGEFUTURE Open Mic!!  4th Tuesdays Monthly!  Free!	2025-01-04 18:57:29.025143	2025-01-04 18:57:29.025143	f
https://palmers-bar.com/calendar/2025/1/29/monarch-in-solid-air-galleon-and-cause-for-concern-5	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/62fbb9bb-4655-4891-b6be-9f5d3a4e52b8/Monarch+1%3A29.jpeg	4915	2025-01-29 19:00:00	37	Monarch, In Solid Air, Galleon and Cause for Concern $5	2025-01-04 18:57:29.025717	2025-01-04 18:57:29.025717	f
https://palmers-bar.com/calendar/2025/1/31/tim-casey-amp-the-martyrs-and-friends	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/7c790d54-d5dc-4d37-8a42-1a71f6b398b3/Tim+Caset%3AThe+Boot+Flyer.jpeg	4917	2025-01-31 20:00:00	37	The Boot R&B, Tim Casey & The Martyrs and Scott Allen and The List	2025-01-04 18:57:29.027489	2025-01-04 18:57:29.027489	f
https://palmers-bar.com/calendar/2025/1/25/redwing-blackbird-and-friends	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/8fe8eb4b-a2b0-4c3c-8188-178332ca8533/RedwingBlackbirdXmas25Story.jpg	4910	2025-01-25 20:00:00	37	Redwing Blackbirds First-Ever Second Annual Christmas Pageant!	2025-01-04 18:57:29.022918	2025-01-04 18:57:29.022918	f
https://palmers-bar.com/calendar/2024/8/11/west-bank-social-club-dk6ce-6r5bx-5hr2l-bzlpc-8k32b-8mbfn-4f9gl-bc84s-by82z-cjc5n-h8n7r-49jaa-pyekc-7dpsg-3hfpl-8ypmy-xtarb-zmkry-b6rh5-r9xrs-drk54-ed3m5-dx6jd	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/db036898-de3b-485b-a976-26903758e7ad/westbanksocialshotglass.jpeg	4912	2025-01-26 20:00:00	37	West Bank Social Club	2025-01-04 18:57:29.024066	2025-01-04 18:57:29.024066	f
https://palmers-bar.com/calendar/2025/1/30/pee-wee-dread-lars-nelson-band-and-the-nick-foytik-band	https://images.squarespace-cdn.com/content/v1/5c07134eb10598355753bfb2/88692593-2ba2-4b46-b015-f86a88f1a791/LarsNelsonFlyer.jpeg	4916	2025-01-30 19:00:00	37	Pee Wee Dread, Lars Nelson Band and The Nick Foytik Band	2025-01-04 18:57:29.026671	2025-01-04 18:57:29.026671	f
\.


--
-- Data for Name: tcupbands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tcupbands (id, name, social_links, genre, bandemail, play_shows, group_size, created_at, music_links, profile_image, other_images, location, bio, slug, claimed_by, claimed_at) FROM stdin;
136	Shoplifting Kink	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:06:05.406025	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			shopliftingkink	\N	2025-01-12 02:06:05.406025-06
139	The Del-Viles	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:06:40.258697	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			thedelviles	\N	2025-01-12 02:06:40.258697-06
144	Sunshine and the Night Walkers	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:08:29.171719	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			sunshineandthenightwalkers	\N	2025-01-12 02:08:29.171719-06
149	Taylor James Donskey	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-12 09:06:37.528216	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			taylorjamesdonskey	\N	2025-01-12 15:06:37.528216-06
73	Gully Boys	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}			{}	2024-12-03 16:33:14.494304	\N	\N	{}	\N	\N	gullyboys	\N	2025-01-09 14:45:01.729766-06
74	Ghosting Merit	{"spotify": "https://open.spotify.com/artist/1wrFo6PJbIqrf8cwdhG5Rq?si=skyLwfBmRVShuOAIE0Brrg", "website": "", "bandcamp": "https://ghostingmerit.bandcamp.com/", "instagram": "", "soundcloud": ""}	{}			{}	2024-12-03 16:41:25.895555	{"spotify": "https://open.spotify.com/album/0Lk6k671jsdFy5AYxP5yI1?si=vRPRySb0TqiEqwtCKMdPSg", "youtube": "", "bandcamp": "https://ghostingmerit.bandcamp.com/album/little-rituals", "soundcloud": ""}	\N	{}	\N	\N	ghostingmerit	\N	2025-01-09 14:45:01.729766-06
75	bathtub cig	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		maybe	{Solo,Duo,Trio,4-piece}	2024-12-05 08:33:18.339812	{"spotify": "https://open.spotify.com/album/7ESFgrL7KHKs9icAL6ogIS?si=K8Jg-PWAR1y27PYW62z8Ww", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}	\N	\N	bathtubcig	\N	2025-01-09 14:45:01.729766-06
76	Bryn Battani	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}			{}	2024-12-05 08:33:56.334841	{"spotify": "https://open.spotify.com/album/3LR5fZOA4m2jlNO2Y4y283?si=KvBEt-7zQnifK2dWRuOY3A", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}	\N	\N	brynbattani	\N	2025-01-09 14:45:01.729766-06
132	26BATS!	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:04:42.703177	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}	Minneapolis, MN		26bats	\N	2025-01-12 02:04:42.703177-06
130	Kiernan	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:03:45.335269	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}	Minneapolis, MN		kiernan	\N	2025-01-12 02:03:45.335269-06
133	Ice Climber	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:05:22.250281	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}	Minneapolis, MN		iceclimber	\N	2025-01-12 02:05:22.250281-06
137	Dog Gamn	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:06:18.857575	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			doggamn	\N	2025-01-12 02:06:18.857575-06
140	Brass Solidarity	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:07:04.982035	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			brasssolidarity	\N	2025-01-12 02:07:04.982035-06
141	Bloom or Bust	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:07:22.208436	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			bloomorbust	\N	2025-01-12 02:07:22.208436-06
142	Phlox Carolina	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:07:30.493123	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			phloxcarolina	\N	2025-01-12 02:07:30.493123-06
145	Oceanographer	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-12 09:05:25.361271	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			oceanographer	\N	2025-01-12 15:05:25.361271-06
146	ERRL	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-12 09:05:39.00876	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			errl	\N	2025-01-12 15:05:39.00876-06
147	Asteroid	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-12 09:05:55.231068	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			asteroid	\N	2025-01-12 15:05:55.231068-06
150	Ray Gun Youth	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-12 09:07:08.427341	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			raygunyouth	\N	2025-01-12 15:07:08.427341-06
131	We are the Willows	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:04:25.273338	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}	Minneapolis, MN		wearethewillows	\N	2025-01-12 02:04:25.273338-06
134	Sunken Moon	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:05:51.74091	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			sunkenmoon	\N	2025-01-12 02:05:51.74091-06
135	Thrush Mother	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:05:58.500974	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			thrushmother	\N	2025-01-12 02:05:58.500974-06
138	Crush Scene	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:06:33.033747	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			crushscene	\N	2025-01-12 02:06:33.033747-06
143	Lucid VanGuard	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-11 20:08:01.77787	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			lucidvanguard	\N	2025-01-12 02:08:01.77787-06
148	A Sharpened Whisper	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2025-01-12 09:06:25.733919	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}	\N	{}			asharpenedwhisper	\N	2025-01-12 15:06:25.733919-06
71	Yellow Ostrich	{"spotify": "https://open.spotify.com/artist/3zIJJVhqINXeuLWMbZdlbY?si=4F4kHB2vSJya1qcsIvJ6dQ", "website": "", "youtube": "https://www.youtube.com/channel/UCrBfVlCltcSVtmUB7iXd9cg", "bandcamp": "https://yellowostrich.bandcamp.com/", "instagram": "instagram.com/yellow.ostrich", "soundcloud": ""}	{"Indie Rock",Guitars,Swoovy}	alex.schaaf@gmail.com	maybe	{Solo,Duo,Trio,4-piece,"5+ piece"}	2024-12-02 21:41:31.739159	{"spotify": "https://open.spotify.com/album/6cxFUhJr7l9RslcU5gq99E?si=Xxg5Z4cSTEOa6ueSqU9Sug", "youtube": "https://youtu.be/BVt_QcCmZ_I?si=cA7wsuO6m2sASDVe", "bandcamp": "", "soundcloud": ""}	https://res.cloudinary.com/dsll3ms2c/image/upload/v1735002949/zjxihcz5vsmtkflzjev5.jpg?c_fill=&g_center=&w=600&h=600&x=0&y=0	{https://res.cloudinary.com/dsll3ms2c/image/upload/v1734977215/wzskrunz5or6xuixdw0t.jpg,https://res.cloudinary.com/dsll3ms2c/image/upload/v1734977214/i3k8umuwp0knefh4scjh.jpg}	Minneapolis, MN	Yellow Ostrich is a long-running project led by Minneapolis-based songwriter Alex Schaaf, who started the band in Brooklyn in 2010 before moving it to the Midwest. The band released Soft in 2022 on Barsuk Records, the first new music in seven years to be released by Schaaf under the Yellow Ostrich moniker, since he paused the project to explore new musical identities on a handful of excellent self-released albums. This was followed by Make it Make Sense (EP) in January of 2023.\n\nThe latest full-length, Soft, takes its name from the lyric that stands as a thesis for the entire album, a beautiful and haunting rumination on the pitfalls and pressures of traditional masculinity and on Schaaf's drive toward vulnerability and tenderness as core tenets of his being.	yellowostrich	auth0|676f46146e408cedfac8db04	2025-01-09 08:56:08.752204-06
\.


--
-- Data for Name: user_shows; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.user_shows (id, user_id, show_id, created_at) FROM stdin;
\.


--
-- Data for Name: user_tcupbands; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.user_tcupbands (id, user_id, tcupband_id, relationship_type, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.users (id, auth0_id, username, avatar_url, created_at, email) FROM stdin;
4	auth0|676f46146e408cedfac8db04	alexschaaf	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736023592/qz5ok1lqayybtoig6ubi.jpg	2025-01-04 14:46:14.679912	alex.schaaf@gmail.com
42	auth0|6771cd27d9da2073ff023d73	babo26	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736365581/12_w5vzts.jpg	2025-01-08 10:54:13.804316	baileycogan26@gmail.com
3	auth0|6771cd99f285b164a3e3032b	TCUP	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736021523/vuaowcy3id6o5bxhzbro.jpg	2025-01-04 14:11:07.547141	tcupminnesota@gmail.com
6	auth0|6771cc6d94b72820417a88bd	*Splash!*	\N	2025-01-08 10:54:13.804316	splash@splashysongs.com
7	auth0|6771cd13dafde15e07d2ffc6	2D_Fruity	\N	2025-01-08 10:54:13.804316	kylertle@gmail.com
8	auth0|6771cd14553a1d0d4f63eb0f	4kdancing	\N	2025-01-08 10:54:13.804316	fallcolor1970@gmail.com
9	auth0|6771cd1494b72820417a88f9	Aang	\N	2025-01-08 10:54:13.804316	anliwinters@icloud.com
10	auth0|6771cd15af57e31773bf1118	aaron	\N	2025-01-08 10:54:13.804316	4lomh17@gmail.com
11	auth0|6771cd16ecab50cce4831602	abriannemusic	\N	2025-01-08 10:54:13.804316	abriannemusic@gmail.com
12	auth0|6771cd16ecab50cce4831603	AbsolutelyYours	\N	2025-01-08 10:54:13.804316	bridgetlcollins@gmail.com
13	auth0|6771cd172357aaf696449e64	Adam.schaberg	\N	2025-01-08 10:54:13.804316	adam.schaberg@gmail.com
14	auth0|6771cd1784f4ad7f942b82d5	Adam Lifto	\N	2025-01-08 10:54:13.804316	twincitiesmnmusic@gmail.com
15	auth0|6771cd18af57e31773bf1119	adamkieffer	\N	2025-01-08 10:54:13.804316	ninjajedi@gmail.com
16	auth0|6771cd18f285b164a3e302e1	Addy0229	\N	2025-01-08 10:54:13.804316	addy.gonzalez@minneapolismn.gov
17	auth0|6771cd190af81649485b25c4	Aerons	\N	2025-01-08 10:54:13.804316	aschulte55@hotmail.com
18	auth0|6771cd19e1f1b133445003fc	admiralfox	\N	2025-01-08 10:54:13.804316	itsadmiralfox@gmail.com
19	auth0|6771cd1a2357aaf696449e67	ahiwr	\N	2025-01-08 10:54:13.804316	lemoneysnicket09@gmail.com
20	auth0|6771cd1b16e8d188ded2c598	aideybaby	\N	2025-01-08 10:54:13.804316	aidan.sponheim@gmail.com
21	auth0|6771cd1b1b2f2ad9bf424769	Al Church	\N	2025-01-08 10:54:13.804316	alchurchandstate@gmail.com
22	auth0|6771cd1ce1f1b133445003ff	alexoberton	\N	2025-01-08 10:54:13.804316	obertale000@gmail.com
23	auth0|6771cd1d16e8d188ded2c59a	alextesting	\N	2025-01-08 10:54:13.804316	alexschaafdesign@gmail.com
24	auth0|6771cd1e1b2f2ad9bf42476a	ALifeinYellow	\N	2025-01-08 10:54:13.804316	blackpollenproject@gmail.com
25	auth0|6771cd1eaf57e31773bf111c	Allison Payonk	\N	2025-01-08 10:54:13.804316	allison.p125@gmail.com
26	auth0|6771cd1f93ea1b9434921b97	aloysiustheband	\N	2025-01-08 10:54:13.804316	aloysiustheband@gmail.com
27	auth0|6771cd2093ea1b9434921b99	andreacuenca	\N	2025-01-08 10:54:13.804316	andrea.glitterfied@gmail.com
28	auth0|6771cd20e1f1b13344500401	Alphstablook156	\N	2025-01-08 10:54:13.804316	thedailynorm.music@gmail.com
29	auth0|6771cd21a2700970f6870bd9	Andy Webber	\N	2025-01-08 10:54:13.804316	adwebber@gmail.com
30	auth0|6771cd21f285b164a3e302e3	andrealeonardmusic	\N	2025-01-08 10:54:13.804316	aleonardstudio@gmail.com
31	auth0|6771cd22553a1d0d4f63eb14	annad	\N	2025-01-08 10:54:13.804316	aagdolde@gmail.com
32	auth0|6771cd2293ea1b9434921b9a	Anothernight	\N	2025-01-08 10:54:13.804316	thehoodandthelyre@gmail.com
33	auth0|6771cd2316e8d188ded2c59e	artymanor	\N	2025-01-08 10:54:13.804316	tgtyoshi@gmail.com
34	auth0|6771cd23e1f1b13344500403	Asheberton	\N	2025-01-08 10:54:13.804316	asheberton.music@gmail.com
35	auth0|6771cd240cf3ae46856bd0ee	athaeryn	\N	2025-01-08 10:54:13.804316	athaeryn@gmail.com
36	auth0|6771cd24553a1d0d4f63eb15	Atim	\N	2025-01-08 10:54:13.804316	atimopoka@gmail.com
37	auth0|6771cd250cf3ae46856bd0f0	audrey.e.stenzel	\N	2025-01-08 10:54:13.804316	audrey.stenzel@icloud.com
38	auth0|6771cd2516e8d188ded2c5a1	AudreyQ	\N	2025-01-08 10:54:13.804316	audrey.q.snyder@gmail.com
39	auth0|6771cd260cf3ae46856bd0f3	azertykeys	\N	2025-01-08 10:54:13.804316	cruznpickle@gmail.com
40	auth0|6771cd26f285b164a3e302e7	Austin James	\N	2025-01-08 10:54:13.804316	acarson138@gmail.com
41	auth0|6771cd27ce83c8ad821440b1	Bari_Spen	\N	2025-01-08 10:54:13.804316	justin@barispen.com
43	auth0|6771cd28af57e31773bf111e	Bcourrier	\N	2025-01-08 10:54:13.804316	bcourrieroaster@gmail.com
44	auth0|6771cd28ecab50cce4831608	bbjornrud	\N	2025-01-08 10:54:13.804316	brettbjornrud@gmail.com
45	auth0|6771cd290af81649485b25ca	beaubass	\N	2025-01-08 10:54:13.804316	beaujamesjeffrey@gmail.com
46	auth0|6771cd2984f4ad7f942b82de	beetroot	\N	2025-01-08 10:54:13.804316	beatriceogeh@icloud.com
47	auth0|6771cd2a0cf3ae46856bd0f5	bekflorey	\N	2025-01-08 10:54:13.804316	boberto379379@gmail.com
48	auth0|6771cd2a2357aaf696449e6c	bek	\N	2025-01-08 10:54:13.804316	rogerflorey13@gmail.com
49	auth0|6771cd2b0af81649485b25cb	ben.ehrlich3	\N	2025-01-08 10:54:13.804316	ben.ehrlich3@gmail.com
50	auth0|6771cd2baf57e31773bf1120	benjamin.johnson@minneapo	\N	2025-01-08 10:54:13.804316	benjamin.johnson@minneapolismn.gov
51	auth0|6771cd2c0af81649485b25cf	benronning	\N	2025-01-08 10:54:13.804316	benronning1@gmail.com
52	auth0|6771cd2cf285b164a3e302e9	ben_of the orchard	\N	2025-01-08 10:54:13.804316	benvbmusic@gmail.com
53	auth0|6771cd2d1b2f2ad9bf424770	biglex	\N	2025-01-08 10:54:13.804316	lexnoens@gmail.com
54	auth0|6771cd2d203e212b4ba3fb43	Bird Bāss	\N	2025-01-08 10:54:13.804316	birdbass.mpls@gmail.com
55	auth0|6771cd2e94b72820417a8903	Bloodsweatandtomtiers	\N	2025-01-08 10:54:13.804316	tommtier@gmail.com
56	auth0|6771cd2eecab50cce483160a	BJ Solely	\N	2025-01-08 10:54:13.804316	beataloopproductions@gmail.com
57	auth0|6771cd2f2357aaf696449e71	BOOBLESS	\N	2025-01-08 10:54:13.804316	boobless.band@gmail.com
58	auth0|6771cd2fa2700970f6870be2	Boyintherosegarden	\N	2025-01-08 10:54:13.804316	boyintherosegarden@gmail.com
59	auth0|6771cd3084f4ad7f942b82e1	brynbattani	\N	2025-01-08 10:54:13.804316	brynbattani@icloud.com
60	auth0|6771cd30dafde15e07d2ffd1	bsjmusicpro	\N	2025-01-08 10:54:13.804316	bsjmusicpro@gmail.com
61	auth0|6771cd310af81649485b25d1	callamae_47	\N	2025-01-08 10:54:13.804316	callamaemcd@gmail.com
62	auth0|6771cd310cf3ae46856bd0fa	CalKeyes	\N	2025-01-08 10:54:13.804316	calvinmichaelkeyes@gmail.com
63	auth0|6771cd31af57e31773bf1122	Bury 'em Deep	\N	2025-01-08 10:54:13.804316	scotthefte@gmail.com
64	auth0|6771cd321b2f2ad9bf424774	calmarino	\N	2025-01-08 10:54:13.804316	calliemmarino@gmail.com
65	auth0|6771cd32553a1d0d4f63eb1a	CaptainLetsDance	\N	2025-01-08 10:54:13.804316	cheesemichaels@gmail.com
66	auth0|6771cd332357aaf696449e74	charlotteciemme	\N	2025-01-08 10:54:13.804316	ciemme.charlotte@gmail.com
67	auth0|6771cd33dafde15e07d2ffd4	Casstronaut	\N	2025-01-08 10:54:13.804316	cassandra.lynn.j@gmail.com
68	auth0|6771cd33dafde15e07d2ffd5	cass_magpie	\N	2025-01-08 10:54:13.804316	onemoreonionmusic@gmail.com
69	auth0|6771cd345e094cfe3ac079bd	Christian Wheeler	\N	2025-01-08 10:54:13.804316	cwheelermusic@gmail.com
70	auth0|6771cd34ce83c8ad821440ba	chippu	\N	2025-01-08 10:54:13.804316	alexajune94@gmail.com
71	auth0|6771cd35ce83c8ad821440bb	claire	\N	2025-01-08 10:54:13.804316	thesilenttreatmentmn@gmail.com
72	auth0|6771cd360af81649485b25d3	comicshans	\N	2025-01-08 10:54:13.804316	shannonrosemaroney@gmail.com
73	auth0|6771cd36d9da2073ff023d7a	Codii	\N	2025-01-08 10:54:13.804316	kracot@gmail.com
74	auth0|6771cd36e1f1b1334450040f	Conzemius	\N	2025-01-08 10:54:13.804316	jillconzemius@gmail.com
75	auth0|6771cd3784f4ad7f942b82e9	Corinne	\N	2025-01-08 10:54:13.804316	blackwidowsempire@gmail.com
76	auth0|6771cd37f285b164a3e302f4	Corndog	\N	2025-01-08 10:54:13.804316	cjccanna@gmail.com
77	auth0|6771cd381b2f2ad9bf424778	curtisthebird	\N	2025-01-08 10:54:13.804316	curtis.bird28@gmail.com
78	auth0|6771cd38ce83c8ad821440bd	creekbedcarter	\N	2025-01-08 10:54:13.804316	creekbedcarter@gmail.com
79	auth0|6771cd391b2f2ad9bf424779	daguerreotypes	\N	2025-01-08 10:54:13.804316	jsamimifarr@gmail.com
80	auth0|6771cd39dafde15e07d2ffdb	daisyforester!	\N	2025-01-08 10:54:13.804316	daisyforester6@gmail.com
81	auth0|6771cd3a553a1d0d4f63eb22	Danielnnz	\N	2025-01-08 10:54:13.804316	danielnnz@gmail.com
82	auth0|6771cd3af285b164a3e302f8	Danierinmusic	\N	2025-01-08 10:54:13.804316	danierinmusic@gmail.com
83	auth0|6771cd3b1b2f2ad9bf42477a	DBjazz	\N	2025-01-08 10:54:13.804316	debbiebriggsmusic@gmail.com
84	auth0|6771cd3b203e212b4ba3fb49	Dante	\N	2025-01-08 10:54:13.804316	dante.leyva.lundberg@gmail.com
85	auth0|6771cd3c94b72820417a890a	deathmetal _gf	\N	2025-01-08 10:54:13.804316	em.velasquez97@gmail.com
86	auth0|6771cd3ca2700970f6870be9	deepriftdweller	\N	2025-01-08 10:54:13.804316	surgefactor@gmail.com
87	auth0|6771cd3d0af81649485b25d6	Dharvey180	\N	2025-01-08 10:54:13.804316	dharvey.bakerit@gmail.com
88	auth0|6771cd3d84f4ad7f942b82eb	dh000	\N	2025-01-08 10:54:13.804316	dylanjhester@gmail.com
89	auth0|6771cd3e0af81649485b25d7	Donniemarvelous	\N	2025-01-08 10:54:13.804316	donniemarvelous@gmail.com
90	auth0|6771cd3e0af81649485b25d8	dreydk	\N	2025-01-08 10:54:13.804316	audreydarstk@gmail.com
91	auth0|6771cd3f2357aaf696449e7a	d’Lakes	\N	2025-01-08 10:54:13.804316	dlakesmusic@gmail.com
92	auth0|6771cd3f5e094cfe3ac079c0	drumminhands	\N	2025-01-08 10:54:13.804316	chris@drumminhands.com
93	auth0|6771cd3f94b72820417a890c	EarlyWorkRecords	\N	2025-01-08 10:54:13.804316	music@earlyworkrecords.com
94	auth0|6771cd4016e8d188ded2c5af	Eli Gardiner	\N	2025-01-08 10:54:13.804316	ebg9@yahoo.com
95	auth0|6771cd40f285b164a3e302f9	earth2noah	\N	2025-01-08 10:54:13.804316	noah@whathurts.com
96	auth0|6771cd4184f4ad7f942b82ed	ellie	\N	2025-01-08 10:54:13.804316	dmsvox@gmail.com
97	auth0|6771cd42d9da2073ff023d80	Emerald Suspension	\N	2025-01-08 10:54:13.804316	emeraldsuspension@gmail.com
98	auth0|6771cd435e094cfe3ac079c2	Ethan Ostrow	\N	2025-01-08 10:54:13.804316	ethanostrowmusic@gmail.com
99	auth0|6771cd43ecab50cce4831611	ersatzpenguin	\N	2025-01-08 10:54:13.804316	nissa.mitchell@icloud.com
100	auth0|6771cd442357aaf696449e7d	evilwizard	\N	2025-01-08 10:54:13.804316	jakeberglove@gmail.com
101	auth0|6771cd445e094cfe3ac079c4	ethan_locrian_opce	\N	2025-01-08 10:54:13.804316	ethan.j.haslauer@gmail.com
102	auth0|6771cd44a2700970f6870bed	flowercaper	\N	2025-01-08 10:54:13.804316	elisepfau@gmail.com
103	auth0|6771cd45553a1d0d4f63eb27	Frank “Fufu” Bass	\N	2025-01-08 10:54:13.804316	frank.loren.bass542@gmail.com
104	auth0|6771cd45ce83c8ad821440c6	FLOWTUS	\N	2025-01-08 10:54:13.804316	flowtusband@gmail.com
105	auth0|6771cd4694b72820417a890e	Garret Nasset	\N	2025-01-08 10:54:13.804316	garret.nasset@gmail.com
106	auth0|6771cd46ce83c8ad821440c7	Geoffrey Laamar Wilson	\N	2025-01-08 10:54:13.804316	geoffreylamarwilson@gmail.com
107	auth0|6771cd47af57e31773bf112e	GG.	\N	2025-01-08 10:54:13.804316	ggdelish@gmail.com
108	auth0|6771cd47dafde15e07d2ffe2	GGDRUMZZ	\N	2025-01-08 10:54:13.804316	gloryyard@yahoo.com
109	auth0|6771cd4816e8d188ded2c5b2	girlattherockshows	\N	2025-01-08 10:54:13.804316	girlattherockshows@gmail.com
110	auth0|6771cd485e094cfe3ac079c7	Ghost117	\N	2025-01-08 10:54:13.804316	alt.kay117@gmail.com
111	auth0|6771cd492357aaf696449e80	GladToBeDead	\N	2025-01-08 10:54:13.804316	pjvanpelt1994@gmail.com
112	auth0|6771cd49a2700970f6870bee	GuyFieri	\N	2025-01-08 10:54:13.804316	dannylololol@gmail.com
113	auth0|6771cd4a93ea1b9434921bb9	hannah-green	\N	2025-01-08 10:54:13.804316	hannahlongley@gmail.com
114	auth0|6771cd4aaf57e31773bf1130	Halfway Down	\N	2025-01-08 10:54:13.804316	halfwaydownguitar@icloud.com
115	auth0|6771cd4b16e8d188ded2c5b6	haydent576	\N	2025-01-08 10:54:13.804316	haydent576@gmail.com
116	auth0|6771cd4ba2700970f6870bef	hayleedee	\N	2025-01-08 10:54:13.804316	haylee.dee.music@gmail.com
117	auth0|6771cd4c0cf3ae46856bd102	hibahzehra	\N	2025-01-08 10:54:13.804316	hibzhas@gmail.com
118	auth0|6771cd4cd9da2073ff023d84	henningh	\N	2025-01-08 10:54:13.804316	henninghanson18@gmail.com
119	auth0|6771cd4daf57e31773bf1134	HoneyPlease	\N	2025-01-08 10:54:13.804316	honeypleasempls@gmail.com
120	auth0|6771cd4dd9da2073ff023d87	Hilary james	\N	2025-01-08 10:54:13.804316	hillajames@gmail.com
121	auth0|6771cd4e94b72820417a8910	Huhroon17	\N	2025-01-08 10:54:13.804316	huhroon17@gmail.com
122	auth0|6771cd4ea2700970f6870bf0	ianrhombus	\N	2025-01-08 10:54:13.804316	ibstenlund@gmail.com
123	auth0|6771cd4f2357aaf696449e86	IOSISdrone	\N	2025-01-08 10:54:13.804316	iosisdrone@gmail.com
124	auth0|6771cd4fe1f1b13344500418	ideasman	\N	2025-01-08 10:54:13.804316	aaron.r.hagenson@gmail.com
125	auth0|6771cd4fecab50cce4831615	ilse	\N	2025-01-08 10:54:13.804316	ilsehogangriffin@gmail.com
126	auth0|6771cd5093ea1b9434921bbe	Jackie Jaworowski	\N	2025-01-08 10:54:13.804316	jrj1024@aol.com
127	auth0|6771cd50a2700970f6870bf2	itskailok	\N	2025-01-08 10:54:13.804316	itskailok@gmail.com
128	auth0|6771cd5184f4ad7f942b82f3	jackstheexpat	\N	2025-01-08 10:54:13.804316	siloshinola@gmail.com
129	auth0|6771cd5184f4ad7f942b82f4	jacobmullis	\N	2025-01-08 10:54:13.804316	jacobrmullis81@gmail.com
130	auth0|6771cd52203e212b4ba3fb55	Jeff S.	\N	2025-01-08 10:54:13.804316	jeffsalladay@gmail.com
131	auth0|6771cd5284f4ad7f942b82f5	Jake Baldwin	\N	2025-01-08 10:54:13.804316	jakebjazz@gmail.com
132	auth0|6771cd53ce83c8ad821440cc	Jer	\N	2025-01-08 10:54:13.804316	satjer@gmail.com
133	auth0|6771cd53f285b164a3e302ff	JennaRosenberg	\N	2025-01-08 10:54:13.804316	jennagrosenberg@gmail.com
134	auth0|6771cd540af81649485b25e4	Jillian Rae	\N	2025-01-08 10:54:13.804316	jillian.rae.music@gmail.com
135	auth0|6771cd54203e212b4ba3fb57	jfrazier	\N	2025-01-08 10:54:13.804316	jacob-frazier@outlook.com
136	auth0|6771cd54af57e31773bf1138	Jerrika	\N	2025-01-08 10:54:13.804316	jerrikamighellemusic@gmail.com
137	auth0|6771cd55553a1d0d4f63eb2c	jimfrankenstein	\N	2025-01-08 10:54:13.804316	brian.reed.design@gmail.com
138	auth0|6771cd555e094cfe3ac079cb	JJsweetheart	\N	2025-01-08 10:54:13.804316	npfrancecamp@gmail.com
139	auth0|6771cd5616e8d188ded2c5bc	jmckay	\N	2025-01-08 10:54:13.804316	mckay.joshua@gmail.com
140	auth0|6771cd56203e212b4ba3fb58	Jmck	\N	2025-01-08 10:54:13.804316	jasamckenzie@gmail.com
141	auth0|6771cd5784f4ad7f942b82f8	Jonah Esty	\N	2025-01-08 10:54:13.804316	jgesty@gmail.com
142	auth0|6771cd57a2700970f6870bf6	JoeBartel	\N	2025-01-08 10:54:13.804316	joe@joebartel.com
143	auth0|6771cd58ecab50cce4831616	Jonathan Waldo	\N	2025-01-08 10:54:13.804316	jonathanwaldo@gmail.com
144	auth0|6771cd590af81649485b25e6	JRMGRL	\N	2025-01-08 10:54:13.804316	jrmgrlmusic@gmail.com
145	auth0|6771cd5a553a1d0d4f63eb30	jvw	\N	2025-01-08 10:54:13.804316	jennifer@buskersguidetotheuniverse.org
146	auth0|6771cd5ae1f1b1334450041f	julietfarmer	\N	2025-01-08 10:54:13.804316	juliethfarmer@gmail.com
147	auth0|6771cd5b0cf3ae46856bd109	kai	\N	2025-01-08 10:54:13.804316	kaibrewstermusic@gmail.com
148	auth0|6771cd5bf285b164a3e30303	K Priest	\N	2025-01-08 10:54:13.804316	k.priest.music@gmail.com
149	auth0|6771cd5c94b72820417a8916	katieb	\N	2025-01-08 10:54:13.804316	katie.blanchard@gmail.com
150	auth0|6771cd5cce83c8ad821440d2	KatieDrahos	\N	2025-01-08 10:54:13.804316	katiedrahos@gmail.com
151	auth0|6771cd5d553a1d0d4f63eb33	Kay	\N	2025-01-08 10:54:13.804316	themselfthe3lf@gmail.com
152	auth0|6771cd5dce83c8ad821440d3	kayjaysmusic	\N	2025-01-08 10:54:13.804316	kayjaysmusic@proton.me
153	auth0|6771cd5e5e094cfe3ac079cf	kberkas	\N	2025-01-08 10:54:13.804316	kberkas43@gmail.com
154	auth0|6771cd5ed9da2073ff023d8d	KaylahRae	\N	2025-01-08 10:54:13.804316	mikaylahnash@gmail.com
155	auth0|6771cd5f84f4ad7f942b82fb	Kema	\N	2025-01-08 10:54:13.804316	kemamn@proton.me
156	auth0|6771cd5fecab50cce483161c	kellallen	\N	2025-01-08 10:54:13.804316	michaela.allen1998@gmail.com
157	auth0|6771cd600cf3ae46856bd10b	kevinscott	\N	2025-01-08 10:54:13.804316	kevin.robert.scott@gmail.com
158	auth0|6771cd60a2700970f6870bfb	kouneli	\N	2025-01-08 10:54:13.804316	mebuck106@gmail.com
159	auth0|6771cd60ecab50cce483161d	KnolTate	\N	2025-01-08 10:54:13.804316	knoltate@gmail.com
160	auth0|6771cd615e094cfe3ac079d1	kschuster777	\N	2025-01-08 10:54:13.804316	kenneth.schuster777@gmail.com
161	auth0|6771cd6184f4ad7f942b82fd	Krissandra	\N	2025-01-08 10:54:13.804316	krissandraaa@gmail.com
162	auth0|6771cd620cf3ae46856bd10e	larry*•*wish	\N	2025-01-08 10:54:13.804316	larrywishmusic@gmail.com
163	auth0|6771cd62a2700970f6870bfc	KTM/Guante	\N	2025-01-08 10:54:13.804316	elguante@gmail.com
164	auth0|6771cd635e094cfe3ac079d3	LarsD121	\N	2025-01-08 10:54:13.804316	p.l.dalton1@gmail.com
165	auth0|6771cd6384f4ad7f942b82ff	lasallesounds	\N	2025-01-08 10:54:13.804316	lasallesounds@gmail.com
166	auth0|6771cd641b2f2ad9bf42478c	laura.kiernan	\N	2025-01-08 10:54:13.804316	lauragkiernan@gmail.com
167	auth0|6771cd64ecab50cce483161e	laurahugomusic	\N	2025-01-08 10:54:13.804316	laurahugomusic@gmail.com
168	auth0|6771cd651b2f2ad9bf42478f	Lazenlow	\N	2025-01-08 10:54:13.804316	lazenlow@gmail.com
169	auth0|6771cd65d9da2073ff023d94	LESLIE	\N	2025-01-08 10:54:13.804316	leslie@marksjmiller.com
170	auth0|6771cd65ecab50cce483161f	LaurenRenae	\N	2025-01-08 10:54:13.804316	renaewerder@gmail.com
171	auth0|6771cd660af81649485b25ea	liammoore	\N	2025-01-08 10:54:13.804316	liammusicmoore@gmail.com
172	auth0|6771cd6794b72820417a8919	liminalgirl	\N	2025-01-08 10:54:13.804316	sofandsmusic@gmail.com
173	auth0|6771cd6794b72820417a891b	liquidchroma	\N	2025-01-08 10:54:13.804316	ben@liquidchroma.com
174	auth0|6771cd68553a1d0d4f63eb37	livxmay	\N	2025-01-08 10:54:13.804316	livxmay@gmail.com
175	auth0|6771cd69553a1d0d4f63eb39	lmaoskeet	\N	2025-01-08 10:54:13.804316	lmaoskeet@gmail.com
176	auth0|6771cd6993ea1b9434921bc9	LoganInMN	\N	2025-01-08 10:54:13.804316	logancombsmusic@gmail.com
177	auth0|6771cd6a94b72820417a891d	LovelyDark_Travis	\N	2025-01-08 10:54:13.804316	traviseven@gmail.com
178	auth0|6771cd6aaf57e31773bf1144	Lucas Rollo	\N	2025-01-08 10:54:13.804316	lakr1212@gmail.com
179	auth0|6771cd6becab50cce4831623	luna_on_drums	\N	2025-01-08 10:54:13.804316	lunaondrums@icloud.com
180	auth0|6771cd6becab50cce4831624	Machine D.	\N	2025-01-08 10:54:13.804316	machinedeisher@gmail.com
181	auth0|6771cd6c0af81649485b25ef	magdalenblack79	\N	2025-01-08 10:54:13.804316	mbpaddington@gmail.com
182	auth0|6771cd6cce83c8ad821440d8	Madds	\N	2025-01-08 10:54:13.804316	maddiejthies@gmail.com
183	auth0|6771cd6cce83c8ad821440d9	MajeAdams	\N	2025-01-08 10:54:13.804316	majeadamsmusic@gmail.com
184	auth0|6771cd6d5e094cfe3ac079da	mark r	\N	2025-01-08 10:54:13.804316	liarsconspiracy@gmail.com
185	auth0|6771cd6daf57e31773bf1146	Mandy	\N	2025-01-08 10:54:13.804316	ahennen97@gmail.com
186	auth0|6771cd6ef285b164a3e3030e	Marvelous	\N	2025-01-08 10:54:13.804316	marvelousmusicmanagement@gmail.com
187	auth0|6771cd6fd9da2073ff023d9f	mayastovall	\N	2025-01-08 10:54:13.804316	mayamaystovall@gmail.com
188	auth0|6771cd6fecab50cce4831628	matt.axe	\N	2025-01-08 10:54:13.804316	matthewaxelson@gmail.com
189	auth0|6771cd6ff285b164a3e30310	Mary Jam	\N	2025-01-08 10:54:13.804316	maryjammusic@gmail.com
190	auth0|6771cd7094b72820417a8924	Mellifera	\N	2025-01-08 10:54:13.804316	mellifera3000@gmail.com
191	auth0|6771cd70dafde15e07d2fffe	maygenandthebw	\N	2025-01-08 10:54:13.804316	maygenandthebw@gmail.com
192	auth0|6771cd71ecab50cce483162a	mikey	\N	2025-01-08 10:54:13.804316	m.margetmusic@gmail.com
193	auth0|6771cd71ecab50cce483162b	modernwildlife	\N	2025-01-08 10:54:13.804316	modernwildlifeband@gmail.com
194	auth0|6771cd720cf3ae46856bd114	monicanikki	\N	2025-01-08 10:54:13.804316	monica.nikki.marie@gmail.com
195	auth0|6771cd7284f4ad7f942b830a	Mollybrandt	\N	2025-01-08 10:54:13.804316	mollybrandtmusic@gmail.com
196	auth0|6771cd732357aaf696449e98	Moosehat	\N	2025-01-08 10:54:13.804316	mason.meyers93@gmail.com
197	auth0|6771cd73ce83c8ad821440de	Morgana Rosa	\N	2025-01-08 10:54:13.804316	morganarosa1991@outlook.com
198	auth0|6771cd73f285b164a3e30314	mooseburger	\N	2025-01-08 10:54:13.804316	kylejohnson.mn@gmail.com
199	auth0|6771cd7494b72820417a8927	mr.funkypotato	\N	2025-01-08 10:54:13.804316	m.gordon.meier@gmail.com
200	auth0|6771cd74f285b164a3e30315	mronenoteatatime	\N	2025-01-08 10:54:13.804316	alan@aprproductions.com
202	auth0|6771cd75e1f1b1334450042c	mya__online	\N	2025-01-08 10:54:13.804316	lysnemya1@gmail.com
203	auth0|6771cd76e1f1b1334450042e	NatanYael	\N	2025-01-08 10:54:13.804316	natanyaelmusic@gmail.com
204	auth0|6771cd76ecab50cce483162e	nadimcgill	\N	2025-01-08 10:54:13.804316	nadi@takeactionminnesota.org
205	auth0|6771cd77a2700970f6870c0e	Nate LeBrun	\N	2025-01-08 10:54:13.804316	natelebrun17@gmail.com
206	auth0|6771cd77dafde15e07d30000	NateWalker	\N	2025-01-08 10:54:13.804316	nathaniel.js.walker@gmail.com
207	auth0|6771cd77e1f1b1334450042f	Natem	\N	2025-01-08 10:54:13.804316	nathanielmarquardt7@gmail.com
208	auth0|6771cd785e094cfe3ac079e0	Nathan(MNHoneypants)	\N	2025-01-08 10:54:13.804316	nsjthethird@gmail.com
209	auth0|6771cd78e1f1b13344500430	Nathan Frazer	\N	2025-01-08 10:54:13.804316	bumdhar@yahoo.com
210	auth0|6771cd792357aaf696449e9b	nathanmaloy	\N	2025-01-08 10:54:13.804316	nathanmaloy101@gmail.com
211	auth0|6771cd795e094cfe3ac079e1	necul002	\N	2025-01-08 10:54:13.804316	neculescu.sonia@gmail.com
212	auth0|6771cd7ace83c8ad821440e3	nickbenish	\N	2025-01-08 10:54:13.804316	nibenish@gmail.com
213	auth0|6771cd7aecab50cce4831630	Nick Elstad	\N	2025-01-08 10:54:13.804316	nickelstad@gmail.com
214	auth0|6771cd7b0cf3ae46856bd11b	Nikki	\N	2025-01-08 10:54:13.804316	nikki.lemire@gmail.com
215	auth0|6771cd7b94b72820417a8929	Northern Hammer	\N	2025-01-08 10:54:13.804316	northernhammerband@gmail.com
216	auth0|6771cd7c1b2f2ad9bf424797	NoSaint76!	\N	2025-01-08 10:54:13.804316	bdjones0928@gmail.com
217	auth0|6771cd7c5e094cfe3ac079e2	Nostalgic	\N	2025-01-08 10:54:13.804316	easril2000@gmail.com
218	auth0|6771cd7da2700970f6870c11	Oliver Books	\N	2025-01-08 10:54:13.804316	oliverbooksmusic@gmail.com
219	auth0|6771cd7de1f1b13344500435	okfriendmusic	\N	2025-01-08 10:54:13.804316	okfriendmusic@gmail.com
220	auth0|6771cd7decab50cce4831634	Oceanographer	\N	2025-01-08 10:54:13.804316	valentinelowryortega@gmail.com
221	auth0|6771cd7e16e8d188ded2c5ca	oliversax	\N	2025-01-08 10:54:13.804316	oliverpwh@gmail.com
222	auth0|6771cd7ed9da2073ff023da9	orchideaton	\N	2025-01-08 10:54:13.804316	orchideaton@gmail.com
223	auth0|6771cd7f0af81649485b25fa	ozzythepainter	\N	2025-01-08 10:54:13.804316	ozzythepainter@gmail.com
224	auth0|6771cd80203e212b4ba3fb73	phloxcarolina	\N	2025-01-08 10:54:13.804316	noas7501@gmail.com
225	auth0|6771cd802357aaf696449e9e	Paper Beast	\N	2025-01-08 10:54:13.804316	sylvandrewz@gmail.com
227	auth0|6771cd8184f4ad7f942b8312	poisonivy	\N	2025-01-08 10:54:13.804316	poisonivyandthepeople@gmail.com
228	auth0|6771cd8194b72820417a892b	planetxan	\N	2025-01-08 10:54:13.804316	planetxan@gmail.com
229	auth0|6771cd82553a1d0d4f63eb45	Rada	\N	2025-01-08 10:54:13.804316	radakmusic@gmail.com
230	auth0|6771cd82ce83c8ad821440e6	Rachael G	\N	2025-01-08 10:54:13.804316	guertinrachael@gmail.com
231	auth0|6771cd832357aaf696449e9f	riah	\N	2025-01-08 10:54:13.804316	riah.timm@gmail.com
232	auth0|6771cd83a2700970f6870c13	rbearinger	\N	2025-01-08 10:54:13.804316	rachel.bearinger@gmail.com
233	auth0|6771cd84dafde15e07d30001	rickygpierce	\N	2025-01-08 10:54:13.804316	rickygpierce91@gmail.com
234	auth0|6771cd84dafde15e07d30002	Rigel	\N	2025-01-08 10:54:13.804316	rigelbr@gmail.com
235	auth0|6771cd851b2f2ad9bf42479b	rosen659	\N	2025-01-08 10:54:13.804316	rosen659@gmail.com
236	auth0|6771cd85d9da2073ff023dac	rileyskinnermusic	\N	2025-01-08 10:54:13.804316	rileymaeburns@gmail.com
237	auth0|6771cd86a2700970f6870c15	ross.clowser	\N	2025-01-08 10:54:13.804316	ross.clowser@gmail.com
238	auth0|6771cd86ecab50cce483163b	rosieharris	\N	2025-01-08 10:54:13.804316	rosemary.m.harris@gmail.com
239	auth0|6771cd8793ea1b9434921bdd	RossThorn	\N	2025-01-08 10:54:13.804316	thornbrothersmusic@gmail.com
240	auth0|6771cd87af57e31773bf1155	ruingazer	\N	2025-01-08 10:54:13.804316	andyl2578@gmail.com
241	auth0|6771cd88af57e31773bf1156	ryanisradd	\N	2025-01-08 10:54:13.804316	ryan.worthley@gmail.com
242	auth0|6771cd88d9da2073ff023daf	ry.ann.aurora	\N	2025-01-08 10:54:13.804316	ryanhays01@gmail.com
243	auth0|6771cd89dafde15e07d30005	Ryleigh	\N	2025-01-08 10:54:13.804316	campmirdo@gmail.com
244	auth0|6771cd89f285b164a3e3031f	SabrinaRose	\N	2025-01-08 10:54:13.804316	sabrinarosebrown2013@gmail.com
245	auth0|6771cd8a94b72820417a8930	SamuelWilbur	\N	2025-01-08 10:54:13.804316	samueljacob.wilbur@gmail.com
246	auth0|6771cd8adafde15e07d30007	SarahSteffen	\N	2025-01-08 10:54:13.804316	sarahmsteffen@gmail.com
247	auth0|6771cd8ba2700970f6870c18	scon	\N	2025-01-08 10:54:13.804316	conover.seth@gmail.com
248	auth0|6771cd8bd9da2073ff023db1	SeanL	\N	2025-01-08 10:54:13.804316	18selebrun@gmail.com
249	auth0|6771cd8c16e8d188ded2c5d3	sethduin	\N	2025-01-08 10:54:13.804316	sethduin@gmail.com
250	auth0|6771cd8c84f4ad7f942b831f	SEER	\N	2025-01-08 10:54:13.804316	seerart777@gmail.com
251	auth0|6771cd8dce83c8ad821440f0	setstill	\N	2025-01-08 10:54:13.804316	michael.edinger11@gmail.com
252	auth0|6771cd8df285b164a3e30324	sh4un0Wh0kn0ws	\N	2025-01-08 10:54:13.804316	shauncware@gmail.com
253	auth0|6771cd8e16e8d188ded2c5d5	sillimilli	\N	2025-01-08 10:54:13.804316	18aaron.miller@gmail.com
254	auth0|6771cd8e93ea1b9434921be1	sig	\N	2025-01-08 10:54:13.804316	signeye99@gmail.com
255	auth0|6771cd8f0cf3ae46856bd124	Simaek	\N	2025-01-08 10:54:13.804316	mcdonaldchristopher365@gmail.com
256	auth0|6771cd8f84f4ad7f942b8322	Simoncropp	\N	2025-01-08 10:54:13.804316	simoncroppmusic@gmail.com
257	auth0|6771cd900af81649485b2602	sisterspecies	\N	2025-01-08 10:54:13.804316	sisterspecies@gmail.com
258	auth0|6771cd9016e8d188ded2c5d7	sj.polk	\N	2025-01-08 10:54:13.804316	sj98.polk@gmail.com
259	auth0|6771cd910cf3ae46856bd126	slano	\N	2025-01-08 10:54:13.804316	shelbymlano@gmail.com
260	auth0|6771cd91dafde15e07d3000d	SmellkinErnesto	\N	2025-01-08 10:54:13.804316	smellkinernesto@gmail.com
261	auth0|6771cd92d9da2073ff023db7	snakejar	\N	2025-01-08 10:54:13.804316	lieblsara@gmail.com
262	auth0|6771cd930cf3ae46856bd127	sofiacoolgreen	\N	2025-01-08 10:54:13.804316	sofiacooltunes@gmail.com
263	auth0|6771cd93dafde15e07d3000f	solace	\N	2025-01-08 10:54:13.804316	solace@gmail.com
264	auth0|6771cd94a2700970f6870c1c	sonboyband	\N	2025-01-08 10:54:13.804316	sonslashboy@gmail.com
265	auth0|6771cd94ce83c8ad821440f2	Sophia Spiegel	\N	2025-01-08 10:54:13.804316	sospiegel@gmail.com
266	auth0|6771cd9516e8d188ded2c5d9	sputnik	\N	2025-01-08 10:54:13.804316	fortywattfriends@gmail.com
267	auth0|6771cd9593ea1b9434921be5	str3tchnutz!	\N	2025-01-08 10:54:13.804316	awadsamira@icloud.com
268	auth0|6771cd9693ea1b9434921be6	sunshineparker	\N	2025-01-08 10:54:13.804316	nightwalkersmusic@gmail.com
269	auth0|6771cd972357aaf696449ead	sydkc	\N	2025-01-08 10:54:13.804316	casey.sydney@gmail.com
270	auth0|6771cd97ce83c8ad821440f4	Sylviadieken	\N	2025-01-08 10:54:13.804316	sylviald10@gmail.com
271	auth0|6771cd981b2f2ad9bf4247a2	taykrae	\N	2025-01-08 10:54:13.804316	taylorhopkins1005@gmail.com
272	auth0|6771cd9893ea1b9434921be9	SystemError	\N	2025-01-08 10:54:13.804316	gricopiipuscles@gmail.com
273	auth0|6771cd98e1f1b13344500440	SYM1 // SYMONE	\N	2025-01-08 10:54:13.804316	sym1project@gmail.com
275	auth0|6771cd99f285b164a3e3032c	TechWizMichael	\N	2025-01-08 10:54:13.804316	techwizmichael@gmail.com
276	auth0|6771cd9aa2700970f6870c20	teeny_crostini	\N	2025-01-08 10:54:13.804316	ccperfetti@gmail.com
277	auth0|6771cd9ace83c8ad821440f8	Test New non-member user	\N	2025-01-08 10:54:13.804316	humanheatusa@gmail.com
278	auth0|6771cd9becab50cce4831641	thedelviles	\N	2025-01-08 10:54:13.804316	thedelviles@gmail.com
279	auth0|6771cd9bf285b164a3e3032e	themessrecords	\N	2025-01-08 10:54:13.804316	info@itsthemess.com
280	auth0|6771cd9bf285b164a3e30331	theyself	\N	2025-01-08 10:54:13.804316	knotheyself@gmail.com
281	auth0|6771cd9c0cf3ae46856bd12c	thunderik	\N	2025-01-08 10:54:13.804316	thirdgatekeeper@gmail.com
282	auth0|6771cd9c5e094cfe3ac079f4	thymn	\N	2025-01-08 10:54:13.804316	thymnmusic@gmail.com
283	auth0|6771cd9d16e8d188ded2c5e2	tinytuesdaysmpls	\N	2025-01-08 10:54:13.804316	patrickjameslarkin@gmail.com
284	auth0|6771cd9daf57e31773bf115f	TJD	\N	2025-01-08 10:54:13.804316	taylor.james.donskey@gmail.com
285	auth0|6771cd9ea2700970f6870c24	tonytruelove	\N	2025-01-08 10:54:13.804316	tonytruelovetunes@gmail.com
286	auth0|6771cd9ed9da2073ff023dbd	Toby	\N	2025-01-08 10:54:13.804316	tobyram2@gmail.com
287	auth0|6771cd9f203e212b4ba3fb83	toomuchbeard	\N	2025-01-08 10:54:13.804316	jebrunojr@gmail.com
288	auth0|6771cd9fe1f1b13344500442	Treedomemn	\N	2025-01-08 10:54:13.804316	nathan@treedomemn.com
289	auth0|6771cd9ff285b164a3e30334	TransDrummer1312	\N	2025-01-08 10:54:13.804316	orionpax4217@gmail.com
290	auth0|6771cda016e8d188ded2c5e4	TrevorNorthsoul	\N	2025-01-08 10:54:13.804316	northsoulmusic@gmail.com
291	auth0|6771cda0d9da2073ff023dbf	trish	\N	2025-01-08 10:54:13.804316	trishlikesbugs@gmail.com
292	auth0|6771cda1dafde15e07d30015	Trystinney	\N	2025-01-08 10:54:13.804316	trystinney@yahoo.com
293	auth0|6771cda1ecab50cce4831649	TSR	\N	2025-01-08 10:54:13.804316	feastoftones@gmail.com
294	auth0|6771cda2203e212b4ba3fb84	tttaaayyy	\N	2025-01-08 10:54:13.804316	taylorlaurenroth@gmail.com
295	auth0|6771cda2f285b164a3e30338	tuhhahmiss	\N	2025-01-08 10:54:13.804316	tuhhahmiss@gmail.com
296	auth0|6771cda32357aaf696449eb2	tumacarter	\N	2025-01-08 10:54:13.804316	tumacarter@gmail.com
297	auth0|6771cda4dafde15e07d30017	Tveitbakk	\N	2025-01-08 10:54:13.804316	ntveitbakk@hmail.com
298	auth0|6771cda4ecab50cce483164b	TySteinley	\N	2025-01-08 10:54:13.804316	tstein4@gmail.com
299	auth0|6771cda516e8d188ded2c5e5	Valerous	\N	2025-01-08 10:54:13.804316	valerie.square@gmail.com
300	auth0|6771cda5a2700970f6870c28	UnderCurrentMPLS	\N	2025-01-08 10:54:13.804316	undercurrentmpls@gmail.com
301	auth0|6771cda60af81649485b260f	Will	\N	2025-01-08 10:54:13.804316	prairieclamor@gmail.com
302	auth0|6771cda694b72820417a8940	wendell	\N	2025-01-08 10:54:13.804316	wendell@wendell-music.com
303	auth0|6771cda72357aaf696449eb5	willchr22	\N	2025-01-08 10:54:13.804316	willchr22@gmail.com
304	auth0|6771cda7dafde15e07d30018	Xochi de la Luna	\N	2025-01-08 10:54:13.804316	xochidelaluna@gmail.com
305	auth0|6771cda8a2700970f6870c29	zoragrey	\N	2025-01-08 10:54:13.804316	zoragreymgmt@gmail.com
306	auth0|6771cda8f285b164a3e3033c	zoya_banana	\N	2025-01-08 10:54:13.804316	z.svet.muee@gmail.com
307	auth0|6771cda92357aaf696449eb7	zzugunruhe	\N	2025-01-08 10:54:13.804316	daniellemichaele@gmail.com
226	auth0|6771cd80ecab50cce4831637	PETER M	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736358646/2_xejp2n.jpg	2025-01-08 10:54:13.804316	wearethewillows@gmail.com
201	auth0|6771cd7593ea1b9434921bd4	nadi	https://res.cloudinary.com/dsll3ms2c/image/upload/v1736358770/7_nn8oz3.jpg\n	2025-01-08 10:54:13.804316	nadirahmcgill@gmail.com
\.


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.venues (id, venue, location, capacity, cover_image, contact, notes, parking, accessibility, owner, rating, created_at, updated_at) FROM stdin;
1	7th St Entry	N 7th St, Minneapolis, MN 55402	250	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876734/7th_St_Entry_lh5xde.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
2	Amsterdam Bar & Hall	6 West 6th Street, Wabasha St N, St Paul, MN 55102	500	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876735/Amsterdam_tr3xdw.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
3	Can Can Wonderland	755 Prior Ave N Suite 004, St Paul, MN 55104	1000	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876736/Can_Can_Wonderland_p4zesu.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
4	Clown Lounge	1601 University Ave W, St Paul, MN 55104	100	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876738/Clown_Lounge_atd8zw.webp	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
5	Armory	500 South 6th St, Minneapolis, MN 55415	8000	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876748/The_Armory_jzcg5k.webp	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
6	The Fillmore	525 N 5th St, Minneapolis, MN 55401	1850	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876748/The_Fillmore_saybv4.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
7	Fine Line	318 N 1st Ave, Minneapolis, MN 55401	650	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Fine_Line_uhltg8.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
8	First Avenue	701 N 1st Ave, Minneapolis, MN 55403	1550	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876740/First_Avenue_we3aa1.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
9	331 Club	331 13th Ave NE, Minneapolis, MN 55413	150	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876735/331_xtrlo3.jpg	events@331club.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
10	Acadia	329 Cedar Ave, Minneapolis, MN 55454	100	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876734/Acadia_azjdeb.webp	booking@acadiacafe.com or booking form on website	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
11	Aster Cafe	125 SE Main St, Minneapolis, MN 55414	100	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876735/Aster_Cafe_bub4xu.jpg	Booking form on website	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
12	Berlin	204 N 1st St, Minneapolis, MN 55401	85	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876735/Berlin_u2chlr.jpg	booking@berlinmpls.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
13	Bryant Lake Bowl	810 W Lake St, Minneapolis, MN 55408	85	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876735/Bryant_Lake_Bowl_m4wg98.jpg	Kristin Van Loon at Kristin@bryantlakebowl.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
14	Cabooze	913 Cedar Ave, Minneapolis, MN 55404	1000	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876736/Cabooze_m8run8.png	Jake Whaley at jake@cabooze.com\t	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
15	Caydence Records	900 Payne Ave, St Paul, MN 55130	50	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876737/Caydence_Records_jojnv5.jpg	Booking form on website	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
16	The Cedar Cultural Center	416 Cedar Ave, Minneapolis, MN 55454	645	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876749/The_Cedar_Cultural_Center_caerdr.jpg	Mary Brabec at mbrabec@thecedar.org\t	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
17	Cloudland	3533 E Lake St, Minneapolis, MN 55406	150	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876738/Cloudland_pj38r9.webp	cloudlandbooking@gmail.com\t	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
18	Day Block Brewing	1105 Washington Ave S, Minneapolis, MN 55415	250	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876738/Dayblock_Brewing_eva8p9.jpg	Booking form on website	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
19	Driftwood Char Bar	4415 Nicollet Ave, Minneapolis, MN 55419	100	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876738/Driftwood_Char_Bar_wti0rs.jpg	info@driftwoodcharbar.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
20	Eagles 34	2507 E 25th St, Minneapolis, MN 55406	200	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876739/Eagles_34_xlkapl.jpg	aaron34booking@gmail.com\t	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
21	The Garage	75 Civic Center Pkwy, Burnsville, MN 55337	350	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876749/The_Garage_lgzdym.jpg	Booking form	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
22	Green Room	2923 Girard Ave S, Minneapolis, MN 55408	400	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876740/Green_Room_xvkzdg.webp	info@greenroommn.com\t	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
23	MirrorLab	3400 Cedar Ave, Minneapolis, MN 55407	80	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876741/MirrorLab_xrb6gd.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
24	Palace Theatre	17 W 7th Pl, St Paul, MN 55102	2500	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876743/Palace_Theatre_svrosh.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
25	Pilllar Forum	2300 Central Ave NE, Minneapolis, MN 55418	100	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876744/Pilllar_Forum_ilnfsr.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
26	Red Sea	320 Cedar Ave South, Minneapolis, MN 55454	200	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876744/Red_Sea_uqcckz.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
27	ROK Music Lounge	882 7th St W Suite 12, St Paul, MN 55102	75	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876746/ROK_Music_Lounge_qixgfn.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
28	Underground Music Cafe	408 N 3rd Ave, Minneapolis, MN 55401	540	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876750/Underground_Music_Cafe_gfi884.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
29	Uptown Theater	2900 Hennepin Ave, Minneapolis, MN 55408	1688	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876750/Uptown_Theater_qhrdaa.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
30	Varsity Theater	1308 SE 4th St, Minneapolis, MN 55414	750	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876752/Varsity_Theater_h34jzv.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
31	White Rock Lounge	417 Broadway St, St Paul, MN 55101	100	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876752/White_Rock_Lounge_ekrlyj.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
32	Zhora Darling	509 1st Ave NE, Minneapolis, MN 55413	200	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876753/Zhora_Darling_egflfw.png	\N	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
33	Hook & Ladder	3010 Minnehaha Ave, Minneapolis, MN 55406	280	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876741/Hook_and_Ladder_byiqe2.jpg	Booking form	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
34	Icehouse	2528 Nicollet Ave, Minneapolis, MN 55404	350	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876741/Icehouse_ces9gh.webp	Booking form	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
35	Memory Lanes	2520 26th Ave S, Minneapolis, MN 55406	200	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876741/Memory_Lanes_geooa6.jpg	info@memorylanes.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
36	Mortimer's	2001 Lyndale Ave S, Minneapolis, MN 55405	250	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876742/Mortimer_s_jeagwa.jpg	mortimersbooking@gmail.com         - for all shows on Wednesdays, email hollandusa@gmail.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
37	Palmer's Bar	500 Cedar Ave, Minneapolis, MN 55454	200	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876743/Palmer_s_yhwuqj.jpg	palmersbarbooking@gmail.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
38	Parkway Theater	4814 Chicago Ave, Minneapolis, MN 55417	365	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876743/Parkway_Theater_djmpvm.jpg	jessica@theparkwaytheater.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
39	Resource	512 E 24th St, Minneapolis, MN 55404	40	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876745/Resource_guyvdn.jpg	resource-mpls.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
40	Seward Cafe	2129 E Franklin Ave, Minneapolis, MN 55404	200	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876745/Seward_Cafe_pzkxmf.jpg	Booking form	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
41	Skyway Theater	2129 E Franklin Ave, Minneapolis, MN 55404	2500	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876746/Skyway_Theater_t1e6w5.jpg	bookings@skywaytheater.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
42	Sociable Cider Works	1500 Fillmore St NE, Minneapolis, MN 55413	110	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876747/Sociable_Cider_Works_wnjtcm.jpg	info@sociablecider.com or this form: https://www.sociablecider.com/visit	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
43	Surly Brewing Festival Field	520 Malcolm Ave SE, Minneapolis, MN 55414	5000	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876747/Surly_Brewing_xwxqsb.jpg	hannahy@surlybrewing.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
44	Terminal Bar	409 E Hennepin Ave, Minneapolis, MN 55414	50	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876756/Terminal_Bar_if9dqe.jpg	Javier  terminalbar32@gmail.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
45	Temple St Paul	1190 W James Ave, St Paul, MN 55105	200	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876747/Temple_St_Paul_y5zcrv.jpg	templesaintpaul@gmail.com	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
46	Turf Club	1601 University Ave W, St Paul, MN 55104	350	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876750/Turf_Club_hhvpmy.jpg	https://first-avenue.com/contact/	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
47	Uptown VFW	2916 Lyndale Ave S, Minneapolis, MN 55408	444	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876751/Uptown_VFW_etcbsr.jpg	hollandusa@gmail.com(Joe Holland)	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
48	White Squirrel	974 7th St W, St Paul, MN 55102	56	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734876752/White_Squirrel_owhnrv.jpg	booking@whitesquirrelbar.com   Chris Parrish and Bri (booking team)	\N	\N	\N	\N	\N	2024-12-22 17:19:51.864644-06	2024-12-22 17:19:51.864644-06
49	Xcel Energy Center	199 W Kellogg Blvd, St Paul, MN 55102	20554	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734880040/xcelenergy_ubscbb.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 19:12:52.920643-06	2024-12-22 19:12:52.920643-06
50	The Fitzgerald Theater	10 E Exchange St, St Paul, MN 55101	1058	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734880040/fitzgerald_prifme.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 19:12:52.920643-06	2024-12-22 19:12:52.920643-06
51	State Theatre	805 Hennepin Ave, Minneapolis, MN 55402	2181	https://res.cloudinary.com/dsll3ms2c/image/upload/v1734880040/state_znvtby.jpg	\N	\N	\N	\N	\N	\N	2024-12-22 19:12:52.920643-06	2024-12-22 19:12:52.920643-06
52	Como Backdoor	Minneapolis, MN	100	https://res.cloudinary.com/dsll3ms2c/image/upload/v1735852903/venues/i77m2bg9sktvobw6x78q.jpg	\N	\N	\N	\N	\N	\N	2025-01-02 15:21:44.059952-06	2025-01-02 15:21:44.059952-06
53	Schooner Tavern	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-09 21:16:24.147722-06	2025-01-09 21:16:24.147722-06
54	Shaw's Bar and Grill	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-09 21:16:24.147722-06	2025-01-09 21:16:24.147722-06
55	The Dubliner Pub	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-09 21:16:24.147722-06	2025-01-09 21:16:24.147722-06
56	Flying V	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-01-09 21:16:24.147722-06	2025-01-09 21:16:24.147722-06
\.


--
-- Data for Name: vrc_drafts; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.vrc_drafts (id, user_id, venue_id, form_data, last_modified, completed) FROM stdin;
\.


--
-- Data for Name: vrc_results; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.vrc_results (id, venue_id, submitted_by, submission_date, num_bands, band_size, attendance, ticket_price, ticket_counts_communicated, num_comp_tickets, is_event_series, event_series_name, payment_amount, payment_rating, payment_structure, payment_structure_known_beforehand, paid_day_of_show, financial_breakdown_provided, payment_notes, mgmt_communication_rating, booking_method, booker_name, venue_promoted_show, felt_respected, has_radius_clause, radius_clause_details, merch_cut_taken, merch_cut_percentage, mgmt_notes, safety_rating, has_security, felt_comfortable, experienced_discrimination, discrimination_details, wants_followup, safety_notes, sound_rating, house_gear_condition, gear_storage_available, sound_notes, hospitality_rating, drink_tickets_provided, green_room_available, food_provided, hospitality_notes, overall_rating, would_play_again, would_recommend, improvement_suggestions, overall_notes, submitter_name, submitter_email, submitter_phone, is_touring_musician, would_return_to_mn, ok_to_contact, is_anonymous, is_deleted, last_modified, date_of_performance) FROM stdin;
1	\N	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	nan	\N	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	\N	NaN	\N	NaN	\N	\N	\N	\N	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
2	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	\N	\N	\N	f	NaN	220	\N	Door Deal	t	t	\N	\N	\N	Independent 	Dave Power (no longer there)	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	f	NaN	3	f	t	t	\N	\N	\N	\N	NaN	\N	alex schaaf	its me	its me	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
3	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	\N	\N	\N	f	Art-a-whirl	1700	\N	Guarantee	t	t	\N	\N	\N	Agent	Eli Awada	\N	f	t	no other shows on the same day 	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	1	4	t	NaN	3	f	t	f	\N	\N	\N	\N	NaN	\N	Nadi\n	gullyboysband@gmail.com	(612) 806-9393	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
4	\N	\N	2025-01-09 20:58:10.632521-06	5	4	\N	\N	\N	\N	f	Art-a-whirl	100	\N	Guarantee	t	f	\N	\N	\N	Independent 	Rose	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	3	f	t	t	\N	\N	\N	\N	This was their first time hosting an event they could have paid more and communication could have been better	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
5	\N	\N	2025-01-09 20:58:10.632521-06	4	1	\N	\N	\N	\N	f	NaN	$100	\N	Guarantee	t	t	\N	\N	\N	Independent 	Suroor (touring act) set it up, not sure who Can Can had on the booking end of things	\N	f	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	3	3	t	NaN	3	f	t	t	\N	\N	\N	\N	NaN	\N	Drey	audreydarstk@gmail.com	(612) 385-0926	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
6	\N	\N	2025-01-09 20:58:10.632521-06	4	2	\N	14.00	\N	\N	f	Midwest Tour	$200. they did $100 guarantee for the locals and $200 for touring	\N	Guarantee	t	t	\N	\N	\N	Independent 	Gina 	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	2	3	t	NaN	3	f	t	f	\N	\N	\N	\N	NaN	\N	suroor	suroor.music901@gmail.com	(501) 283-5028	t	t	t	f	f	2025-01-09 20:58:10.632521-06	\N
7	\N	\N	2025-01-09 20:58:10.632521-06	6	6	\N	5.00	\N	\N	f	Wort Tour	350	\N	Guarantee	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Dante Leyva 	danteleyva9@gmail.com	(612) 385-2336	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
8	\N	\N	2025-01-09 20:58:10.632521-06	1	3	\N	0.00	\N	\N	f	NaN	300	\N	Guarantee	t	t	\N	\N	\N	Independent 	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	\N	2	\N	NaN	\N	f	\N	t	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
9	\N	\N	2025-01-09 20:58:10.632521-06	1	1	\N	0.00	\N	\N	f	Friday night music	250	\N	Guarantee	t	t	\N	\N	\N	Independent 	Me!	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	4	5	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Emmy Woods	emmywoodsmusic@gmail.com	(253) 617-5866	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
11	\N	\N	2025-01-09 20:58:10.632521-06	5	2	\N	15.00	\N	\N	f	NaN	80	\N	Door Deal	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
12	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	10.00	\N	\N	f	NaN	$40	\N	Door Deal	t	t	\N	\N	\N	Independent 	(someone in haze gazer)	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	3	2	t	NaN	\N	f	f	f	\N	\N	\N	\N	backline list not communicated after request	\N	graham findell 	8maharg8@gmail.com	(763) 370-4447	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
13	\N	\N	2025-01-09 20:58:10.632521-06	4	1	\N	10.00	\N	\N	f	Backyard Blend	$60	\N	Door Deal	t	f	\N	\N	\N	Independent 	Caroline Litteken	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	t	\N	\N	\N	\N	NaN	\N	Mike Horvath 	mhorvy@gmail.com	(630) 400-6155	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
14	\N	\N	2025-01-09 20:58:10.632521-06	2	4	\N	\N	\N	\N	f	David Feily Ice House Residency	$366 for door and a $200 guarantee from a Macphail sponsorship 	\N	Door Deal	t	f	\N	\N	\N	Independent 	JT Bates / David Feily	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Eli Awada	Eliawada3@gmail.com	(651) 600-1743	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
15	\N	\N	2025-01-09 20:58:10.632521-06	\N	1	\N	\N	\N	\N	f	Twin Cities Songwriter Rounds 	50	\N	Door Deal	t	t	\N	\N	\N	Independent 	Taylor Donskey 	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
16	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	\N	\N	\N	f	NaN	$400	\N	Guarantee	t	t	\N	\N	\N	Independent 	Gina	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
17	\N	\N	2025-01-09 20:58:10.632521-06	2	5	\N	0.00	\N	\N	f	NaN	0	\N	Free Show (Tip based)	t	\N	\N	\N	\N	Independent 	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	\N	NaN	f	NaN	\N	f	f	f	\N	\N	\N	\N	We were never informed that the venue didn't have a house sound tech. We found this out last minute and ended up having to hire our own out of pocket. There was also no house gear and no place for attendees to leave tips.	\N	Beatrice Ogeh	beatriceogeh@icloud.com	(651) 434-5068	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
18	\N	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	30.00	\N	\N	f	GALA Choruses 	I was paid $400	\N	Guarantee	t	f	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	NaN	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	Maddie Thies	maddiejthies@gmail.com	(612) 323-3768	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
19	\N	\N	2025-01-09 20:58:10.632521-06	3	2	\N	\N	\N	\N	f	NaN	$300	\N	Guarantee	t	t	\N	\N	\N	Independent 	Not sure	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	4	f	t	f	\N	\N	\N	\N	NaN	\N	Alex Schaaf	alex.schaaf@gmail.com	(920) 809-5713	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
20	\N	\N	2025-01-09 20:58:10.632521-06	3	7	\N	\N	\N	\N	f	NaN	1600	\N	Guarantee	t	t	\N	\N	\N	Independent 	Adam	\N	t	f	NaN	f	\N	\N	\N	\N	\N	\N	NaN	\N	\N	4	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Emily Kastrul	Sisterspecies@gmail.com	(612) 708-1630	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
21	\N	\N	2025-01-09 20:58:10.632521-06	1	1	\N	5.00	\N	\N	f	NaN	$80	\N	Door Deal	t	f	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	\N	NaN	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
22	\N	\N	2025-01-09 20:58:10.632521-06	5	2	\N	5.00	\N	\N	f	Artepils	$300	\N	Guarantee	t	t	\N	\N	\N	Independent 	Emmy Woods	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Emmy Woods	emmywoodsmusic@gmail.com	(253) 617-5866	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
24	\N	\N	2025-01-09 20:58:10.632521-06	2	5	\N	\N	\N	\N	f	Free summer season	$450	\N	Guarantee	t	t	\N	\N	\N	Independent 	drey dk 	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	NaN	t	NaN	5	f	t	t	\N	\N	\N	\N	NaN	\N	Bailey	26bats@gmail.com	(651) 757-8357	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
10	\N	\N	2024-06-14 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$300	5	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	5	\N	\N	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
23	\N	\N	2024-07-25 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$300	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	Deacon Warner	dkenwarner@gmail.com	(612) 232-5112	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
25	\N	\N	2024-09-05 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$150 for 2 solo performers	2	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	No house gear	\N	NaN	4	\N	\N	\N	\N	4	t	t	NaN	\N	Amanda 	Amandastandalonemusic@gmail.com	(218) 772-8041	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
27	\N	\N	2024-10-04 00:00:00-05	\N	\N	\N	10.00	\N	\N	f	NaN	$152	5	Door Deal	\N	t	\N	\N	5	Independent 	Mandi	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	4	Drums and hardware were fantastic (as to be expected for a drum store haha) and no issues with other house gear. They had their own bass amp (which we didn’t use), but they do not have their own guitar amps.	f	NaN	4	f	f	f	\N	5	t	t	NaN	\N	Sanath Aithala	Sanath.aithala98@gmail.com	(713) 517-5820	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
106	\N	\N	2025-01-09 20:58:10.632521-06	\N	5	\N	\N	\N	\N	f	NaN	total 1124 	\N	Door Deal	t	t	\N	\N	\N	Independent 	tanner 	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	4	\N	t	f	\N	\N	\N	\N	Advance sent sooner, clearer door/show times 	\N	rosie 	rrosiecastano@gmail.com	(952) 207-4231	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
28	\N	\N	2024-10-11 00:00:00-05	3	4	\N	\N	\N	\N	f	NaN	2095	5	Other (please explain)	\N	t	\N	\N	2	Agent	no idea	\N	t	f	NaN	f	\N	\N	4	f	t	f	NaN	\N	\N	1	none available	t	NaN	3	f	t	t	\N	4	t	t	NaN	\N	Nadi McGill	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
30	\N	\N	2024-11-23 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$15	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	t	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
31	\N	\N	2024-12-08 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$200	2	NaN	\N	\N	\N	\N	1	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	3	\N	\N	\N	\N	1	f	f	NaN	\N	Molly Brandt	Mollybrandtmusic@gmail.com	(612) 655-2666	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
41	\N	\N	2025-01-09 20:58:10.632521-06	1	1	\N	0.00	\N	\N	f	NaN	$150	\N	Guarantee	t	t	\N	\N	\N	Independent 	Jason Woolwrt	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Gigi Amal	Gg.theukulady@gmail.com	(612) 267-4603	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
42	\N	\N	2025-01-09 20:58:10.632521-06	2	5	\N	0.00	\N	\N	f	NaN	60	\N	Free Show (Tip based)	f	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	Discussion of pay	\N	NaN	NaN	NaN	t	t	f	f	f	2025-01-09 20:58:10.632521-06	\N
43	\N	\N	2025-01-09 20:58:10.632521-06	\N	9	\N	\N	\N	\N	f	Residency 	Very little. 	\N	Guarantee	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
44	\N	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	200 + tips	\N	Guarantee	t	t	\N	\N	\N	Independent 	Jason Woolery 	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	3	f	NaN	\N	f	f	f	\N	\N	\N	\N	More transparency/connection to management 	\N	Taylor	Taylor.James.Donskey@gmail.com	(608) 792-0348	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
45	\N	\N	2025-01-09 20:58:10.632521-06	3	5	\N	\N	\N	\N	f	NaN	108	\N	Door Deal	t	f	\N	\N	\N	Independent 	Bakermiller Pink	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	NaN	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Drew d’Lakes	dlakesmusic@gmail.com	(763) 350-6970	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
46	\N	\N	2025-01-09 20:58:10.632521-06	1	5	\N	0.00	\N	\N	f	NaN	200	\N	Guarantee	t	t	\N	\N	\N	Independent 	Jason	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	f	NaN	\N	f	f	t	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
47	\N	\N	2025-01-09 20:58:10.632521-06	1	3	\N	0.00	\N	\N	f	NaN	$200	\N	Guarantee	t	t	\N	\N	\N	Independent 	Emmy Woods	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Emmy Woods	emmywoodsmusic@gmail.com	(253) 617-5866	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
48	\N	\N	2025-01-09 20:58:10.632521-06	2	5	\N	0.00	\N	\N	f	Tuesday Night Conspiracy Theory 	$100	\N	Guarantee	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Emmy Woods	emmywoodsmusic@gmail.com	(253) 617-5866	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
49	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	0.00	\N	\N	f	NaN	nan	\N	NaN	\N	\N	\N	\N	\N	Independent 	NaN	\N	t	\N	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	\N	NaN	\N	\N	f	\N	\N	\N	\N	\N	NaN	\N	Ethan	thedelviles@gmail.com	(402) 983-0573	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
32	\N	\N	2024-12-12 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	100 - tips only	4	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	1	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	1	\N	\N	\N	\N	2	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
52	10	\N	2024-11-02 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	70	4	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	3	\N	\N	\N	\N	4	\N	\N	NaN	\N	Allison	Allison.p125@gmail.com	(320) 292-6742	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
53	10	\N	2024-11-14 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	I’m not sure! I gifted my cut to the host for his bday!	\N	NaN	\N	\N	\N	\N	5	Independent 	NaN	\N	\N	f	NaN	\N	\N	\N	5	f	t	f	NaN	\N	\N	\N	NaN	\N	checked	5	\N	\N	\N	\N	4	\N	\N	NaN	\N	Glam Toyota	glamtoyota@gmail.com	(414) 217-7542	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
56	2	\N	2024-08-14 00:00:00-05	\N	\N	\N	12.00	\N	\N	f	NaN	150 	5	Door Deal	\N	t	\N	\N	5	Independent 	Alex! 	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	5	Great! 	t	NaN	5	f	t	f	\N	5	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
54	\N	\N	2025-01-09 20:58:10.632521-06	1	4	\N	\N	\N	\N	f	Golden Garters Burlesque monthly residency	$400	\N	Guarantee	t	t	\N	\N	\N	Independent 	Golden Garters Revue, very little communication with Amsterdam directly	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	3	t	NaN	4	f	t	t	\N	\N	\N	\N	NaN	\N	Rachael 	guertinrachael@gmail.com	(651) 279-7775	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
55	\N	\N	2025-01-09 20:58:10.632521-06	4	5	\N	\N	\N	\N	f	NaN	372	\N	Door Deal	t	t	\N	\N	\N	Independent 	Brenda	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	Dante	dante.leyva.lundberg@gmail.com	(612) 385-2336	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
57	11	\N	2024-12-05 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	80.00	4	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
58	11	\N	2024-12-05 00:00:00-06	\N	\N	\N	10.00	\N	0	f	NaN	$80	3	Door Deal	\N	t	\N	\N	3	Independent 	NaN	\N	f	f	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	2	NaN	f	NaN	2	f	f	t	\N	2	f	f	NaN	\N	Syd Casey	ghostingmeritband@gmail.com	(863) 224-4758	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
59	11	\N	2024-12-05 00:00:00-06	3	4	\N	10.00	\N	\N	f	NaN	80 total	2	Door Deal	\N	t	\N	\N	1	Independent 	Johnny Balmer	\N	f	t	NaN	f	\N	\N	3	f	t	f	NaN	\N	\N	1	Issues with grounding for the amps. Bad hum on the bass amp (hasn’t happened at most other venues we used it at)	t	NaN	3	f	f	t	\N	3	t	f	NaN	\N	Willow Waters	willowwaters108@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
63	13	\N	2024-07-02 00:00:00-05	3	2	\N	\N	\N	\N	f	NaN	$152.50	2	Door Deal	\N	f	\N	\N	4	Independent 	Kristin Van Loon 	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	4	It worked!	t	NaN	3	f	\N	f	\N	3	f	\N	NaN	\N	morgan	badpostureclub@gmail.com	(360) 510-4116	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
60	\N	\N	2025-01-09 20:58:10.632521-06	1	4	\N	0.00	\N	\N	f	NaN	600	\N	Guarantee	t	t	\N	\N	\N	Independent 	Alex Proctor	\N	t	f	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	5	5	\N	NaN	5	\N	t	t	\N	\N	\N	\N	NaN	\N	Patrick Adkins	pjapiano@gmail.com	(612) 816-4848	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
61	\N	\N	2025-01-09 20:58:10.632521-06	1	3	\N	\N	\N	\N	f	NaN	600	\N	Guarantee	t	t	\N	\N	\N	Independent 	Alex Proctor 	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	t	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
62	\N	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	0.00	\N	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	\N	NaN	\N	checked	\N	\N	\N	\N	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
64	\N	\N	2025-01-09 20:58:10.632521-06	3	7	\N	14.00	\N	\N	f	NaN	$350	\N	Door Deal	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	3	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Sunshine Parker	nightwalkersmusic@gmail.com	(651) 303-7098	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
65	\N	\N	2025-01-09 20:58:10.632521-06	5	1	\N	14.00	\N	\N	f	NaN	100	\N	Guarantee	t	t	\N	\N	\N	Independent 	Gina Bailey	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
66	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	\N	\N	\N	f	NaN	$450	\N	Guarantee	t	t	\N	\N	\N	Independent 	Gina Bailey	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	4	t	NaN	3	f	t	f	\N	\N	\N	\N	NaN	\N	Make	makekeene@gmail.com	(906) 397-6313	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
69	3	\N	2024-10-26 00:00:00-05	4	4	\N	14.00	\N	\N	f	NaN	750	5	Guarantee	\N	t	\N	\N	5	Independent 	NaN	\N	\N	\N	NaN	f	\N	\N	5	\N	t	f	NaN	\N	\N	5	great	t	NaN	5	f	t	f	\N	5	t	t	NaN	\N	Brian Jones	BDJones0928@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
71	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	15.00	\N	\N	f	NaN	$35	\N	Door Deal	t	t	\N	\N	\N	Independent 	unknown	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	4	t	NaN	\N	f	f	f	\N	\N	\N	\N	wasn't made aware of what was being backlined until arrival, no presale ticket count	\N	graham findell	8maharg8@gmail.com	(763) 370-4447	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
72	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	15.00	\N	\N	f	NaN	450	\N	Door Deal	t	t	\N	\N	\N	Independent 	Brad	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	Communication of payout structure was poor at best. There was no communication of how their online ticketing platform would affect the pay cut. We made around $400 less than I’d anticipated and when I brought it to their attention, they somehow found money to pay us $200 more (still less than what I anticipated us making at a sellout)	\N	Emily	Bugsybandofficial@gmail.com	(612) 232-1410	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
77	17	\N	2024-10-24 00:00:00-05	3	5	\N	\N	\N	5	f	NaN	$50	5	Door Deal	\N	t	\N	\N	5	Independent 	Brad	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	4	Great drums and bass amp provided	t	NaN	5	f	f	f	\N	5	t	t	NaN	\N	Orion	extraterrestrialsband@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
78	17	\N	2024-11-07 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	100.00	4	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	4	t	t	NaN	\N	Ellie Jackson	eldridge.jackson@gmail.com	NaN	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
73	\N	\N	2025-01-09 20:58:10.632521-06	4	5	\N	\N	\N	\N	f	NaN	$142	\N	Door Deal	t	t	\N	\N	\N	Independent 	Brad Lokkesmoe	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	1	3	t	NaN	\N	f	f	f	\N	\N	\N	\N	Venue could have responded to messages in a more timely manner. Did not know anything about splits until the day before the show and that was after many emails sent attempting to get this information. 	\N	Brandon Evilla	cheapbouquetmpls@gmail.com	(765) 744-1316	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
74	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	12.00	\N	\N	f	NaN	$0	\N	Door Deal	t	f	\N	\N	\N	Independent 	Claire Rogalsky	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Juno Lee	junoleejo@gmail.com	(612) 876-7369	t	f	t	f	f	2025-01-09 20:58:10.632521-06	\N
75	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	\N	\N	\N	f	NaN	$20 to each band	\N	Door Deal	f	f	\N	\N	\N	Independent 	NaN	\N	t	\N	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	4	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Dani	Reallyfullcatholic@gmail.com	(540) 521-5632	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
79	17	\N	2024-11-07 00:00:00-06	3	4	\N	15.00	\N	\N	f	NaN	We decided to give all the money to the only touring band on the bill - the total amount made after the venue breakdown was a shocking $23. But Cloudland decided to just give $100 total to the touring band since they were on tour. 	3	Other (please explain)	\N	t	\N	\N	4	Independent 	Brad Lokkesmoe	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	4	Good	t	NaN	5	f	f	f	\N	4	t	t	NaN	\N	Spaceport	spaceportband@gmail.com	(612) 532-4790	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
80	17	\N	2024-11-08 00:00:00-06	3	4	\N	15.00	\N	4	f	NaN	$165	4	NaN	\N	t	\N	\N	5	Independent 	NaN	\N	t	\N	NaN	\N	\N	\N	5	f	t	f	NaN	\N	\N	5	New	t	NaN	5	f	f	f	\N	5	t	t	NaN	\N	Laura Hugo	Laurahugomusic@gmail.com	(612) 552-9074	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
85	18	\N	2024-09-27 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$530 	4	Door Deal	\N	f	\N	\N	4	Independent 	The owner	\N	f	f	NaN	f	\N	\N	5	\N	\N	\N	NaN	\N	\N	1	NaN	t	NaN	4	f	f	t	\N	3	f	f	NaN	\N	Joe Barron 	jbarronbass.getdown@gmail.com	(603) 660-9144	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
86	18	\N	2024-10-04 00:00:00-05	2	7	\N	\N	\N	\N	f	NaN	142.50	3	Door Deal	\N	f	\N	\N	5	Independent 	Mason	\N	t	f	NaN	f	\N	\N	5	\N	t	f	NaN	\N	\N	3	NaN	t	NaN	5	f	f	t	\N	4	t	f	NaN	\N	Sunshine Parker	nightwalkersmusic@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
88	19	\N	2024-11-30 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	0	1	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	3	\N	\N	\N	NaN	\N	\N	1	NaN	\N	checked	1	\N	\N	\N	\N	1	f	f	NaN	\N	Tess Late (aka crypt.ID)	Taylor.kestrel@gmail	(262) 384-0119	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
81	\N	\N	2025-01-09 20:58:10.632521-06	3	\N	\N	10.00	\N	\N	f	NaN	0	\N	Guarantee	t	f	\N	\N	\N	Independent 	??	\N	\N	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	\N	4	t	NaN	\N	f	f	t	\N	\N	\N	\N	Faster communication. They could have paid me what they told me!	\N	Andrea 	Aleonardstudio@gmail.com	(651) 403-3344	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
82	\N	\N	2025-01-09 20:58:10.632521-06	3	1	\N	10.00	\N	\N	f	NaN	We were guaranteed $100 each, as of this date I we still have not been paid (8-13-24)	\N	NaN	\N	f	\N	\N	\N	Independent 	Unsure, I was asked to play by someone else on the bill 	\N	\N	\N	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	\N	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
83	\N	\N	2025-01-09 20:58:10.632521-06	3	5	\N	\N	\N	\N	f	NaN	venmo	\N	Door Deal	f	f	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	NaN	f	NaN	\N	f	f	t	\N	\N	\N	\N	NaN	\N	anni	annixomusic@gmail.com	(612) 323-8671	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
84	\N	\N	2025-01-09 20:58:10.632521-06	8	\N	\N	15.00	\N	\N	f	NaN	we took door sales only, which some was withheld. Total door was around $650. 	1	Door Deal	\N	f	\N	\N	2	Independent 	Jeff Hahn 	\N	\N	f	NaN	f	\N	\N	4	f	t	t	Classist based on genre, maybe sexist since me and my business partner are both women. 	\N	\N	\N	NaN	\N	NaN	2	\N	\N	\N	\N	\N	f	f	NaN	\N	Joslyn	Joslyndanielson@gmail.com	(218) 491-3789	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
94	20	\N	2024-11-11 00:00:00-06	2	2	\N	10.00	\N	0	f	NaN	386	5	Door Deal	\N	t	\N	\N	\N	NaN	NaN	\N	t	\N	NaN	\N	\N	\N	5	f	t	f	NaN	\N	\N	5	Good	t	NaN	3	f	f	f	\N	4	t	t	NaN	\N	Mattie	Rynkiewicz	matthewrynk@gmail.com	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
87	\N	\N	2025-01-09 20:58:10.632521-06	3	1	\N	5.00	\N	\N	f	NaN	0	\N	Door Deal	\N	f	\N	\N	\N	Independent 	NaN	\N	f	\N	NaN	\N	\N	\N	\N	f	\N	\N	NaN	\N	\N	1	2	t	NaN	\N	f	\N	\N	\N	\N	\N	\N	manager gave wrong information about load in and then screamed at us like that was our fault	\N	evelyn rivers	evelynr1312@gmail.com	(727) 599-9460	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
95	7	\N	2024-08-17 00:00:00-05	5	4	\N	\N	\N	\N	f	NaN	1200	5	Guarantee	\N	f	\N	\N	4	Independent 	we booked thru a festival putting in the show 	\N	\N	f	NaN	f	\N	\N	4	t	t	f	NaN	\N	\N	2	NaN	\N	checked	2	\N	\N	\N	\N	4	t	t	NaN	\N	Nadi	gullyboysband@gmail.com	628069363	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
89	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	15.00	\N	\N	f	NaN	$40	\N	Door Deal	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	3	3	f	NaN	\N	f	f	t	\N	\N	\N	\N	NaN	\N	Xochi de la Luna	xochidelaluna@gmail.com	(612) 220-1943	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
90	\N	\N	2025-01-09 20:58:10.632521-06	5	5	\N	10.00	\N	\N	f	Tiny Tuesdays	66	\N	Door Deal	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	\N	\N	\N	NaN	\N	\N	5	5	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
91	\N	\N	2025-01-09 20:58:10.632521-06	3	5	\N	10.00	\N	\N	f	NaN	$210	\N	Door Deal	t	t	\N	\N	\N	Independent 	N/a	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	4	4	t	NaN	\N	f	f	f	\N	\N	\N	\N	I was asked to play this gig and accepted, was just along for the ride 	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
92	\N	\N	2025-01-09 20:58:10.632521-06	4	5	\N	10.00	\N	\N	f	NaN	With the 85/15 split and after tilling the door person and sound person we had about $760 to split between the four bands and$50 for the photographer we hired.	\N	Door Deal	t	t	\N	\N	\N	Independent 	Dan Turund	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
99	22	\N	2024-05-23 00:00:00-05	3	4	\N	\N	\N	\N	f	NaN	200	3	Door Deal	\N	t	\N	\N	1	Independent 	Tanner Montague	\N	t	f	NaN	f	\N	\N	4	f	t	f	NaN	\N	\N	4	NaN	f	NaN	2	t	t	f	\N	2	f	f	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
107	22	\N	2024-09-17 00:00:00-05	3	5	\N	\N	\N	\N	f	NaN	$180 total, $60 per band	4	Door Deal	\N	\N	\N	\N	3	NaN	NaN	\N	t	f	NaN	f	\N	\N	4	\N	\N	\N	NaN	\N	\N	5	Great	t	NaN	4	\N	t	f	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
108	22	\N	2024-10-02 00:00:00-05	3	4	\N	\N	\N	\N	f	NaN	920	5	Door Deal	\N	t	\N	\N	2	Independent 	Tanner	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	4	NaN	t	NaN	2	f	t	f	\N	4	t	t	NaN	\N	Nadi McGill	nadirahmcgill@gmail.com	(612) 806-9363	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
96	\N	\N	2025-01-09 20:58:10.632521-06	4	3	\N	\N	\N	\N	f	NaN	$320.00	\N	Door Deal	t	f	\N	\N	\N	Independent 	Uknown	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	4	f	NaN	4	f	t	t	\N	\N	\N	\N	NaN	\N	Aidan	aidan.sponheim@gmail.com	(612) 619-9012	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
97	\N	\N	2025-01-09 20:58:10.632521-06	4	6	\N	\N	\N	\N	f	NaN	After split with other bands 450$	\N	Door Deal	t	t	\N	\N	\N	Independent 	Dylan	\N	t	t	Can’t advertise other bands on bill until they completed their show at 7th st 3 weeks prior.	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	t	\N	\N	\N	\N	NaN	\N	Griffin	Griffin.baumann@gmail.com	(507) 301-7541	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
98	\N	\N	2025-01-09 20:58:10.632521-06	4	6	\N	\N	\N	\N	f	NaN	1004 to split amongst 4 bands 	\N	Door Deal	t	t	\N	\N	\N	Independent 	Dylan	\N	t	t	'Soft radius clause' first ave didnt want us announce our entry show in August till after this one 	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	4	4	t	NaN	3	f	t	f	\N	\N	\N	\N	NaN	\N	Dante 	dante.leyva.lundberg@gmail.com	(612) 385-2336	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
26	3	\N	2024-10-03 00:00:00-05	4	6	\N	\N	\N	\N	f	NaN	600	5	Guarantee	\N	t	\N	\N	5	Independent 	NaN	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	4	NaN	f	NaN	3	f	f	f	\N	5	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
100	\N	\N	2025-01-09 20:58:10.632521-06	4	5	\N	15.00	\N	\N	f	NaN	170	\N	Door Deal	t	t	\N	\N	\N	Independent 	Nate Walker	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
101	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	12.00	\N	\N	f	NaN	$50 per person	\N	Door Deal	t	t	\N	\N	\N	Independent 	Nate Walker	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
102	\N	\N	2025-01-09 20:58:10.632521-06	4	8	\N	89.00	\N	\N	f	NaN	200	\N	Door Deal	t	t	\N	\N	\N	Independent 	Nate	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
103	\N	\N	2025-01-09 20:58:10.632521-06	3	1	\N	10.00	\N	\N	f	NaN	$142	\N	Door Deal	t	t	\N	\N	\N	Independent 	Nate Walker	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
104	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	\N	\N	\N	f	NaN	2000 before payout	\N	Door Deal	f	t	\N	\N	\N	Independent 	Tanner	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	3	5	t	NaN	3	f	t	f	\N	\N	\N	\N	Very poor response rate, didn’t send an advance until the day of	\N	Henning	henninghanson18@gmail.com	(608) 518-2135	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
105	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	\N	\N	\N	f	NaN	$600	\N	Door Deal	t	t	\N	\N	\N	Independent 	Tanner Montague, venue owner	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	4	5	t	NaN	4	f	t	f	\N	\N	\N	\N	Responses from the owner were few and far between, we received the show advance only a few hours before soundcheck. 	\N	Daisy Forester	daisyforester6@gmail.com	(612) 827-7304	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
110	22	\N	2024-10-05 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$1500	5	NaN	\N	\N	\N	\N	2	Agent	Tanner 	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	5	Pa felt great 	t	NaN	3	f	t	f	\N	5	t	t	NaN	\N	Peter miller	wearethewillows@gmail.com 	(651) 216-1585	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
111	22	\N	2024-10-15 00:00:00-05	3	6	\N	\N	\N	\N	f	NaN	$371	5	Door Deal	\N	t	\N	\N	2	Independent 	Tanner	\N	t	f	NaN	f	\N	\N	4	t	t	f	NaN	\N	\N	4	NaN	t	NaN	4	f	t	f	\N	4	t	t	NaN	\N	Bryn Battani	brynbattani@icloud.com	(678) 800-2181	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
115	33	\N	2024-10-11 00:00:00-05	3	6	\N	\N	\N	\N	f	NaN	880	5	Door Deal	\N	t	\N	\N	5	Independent 	Corinne Caouette	\N	t	t	1 month 	f	\N	\N	5	t	t	f	NaN	\N	\N	4	NaN	t	NaN	4	f	f	f	\N	5	t	t	NaN	\N	Andrew S. Lentz (Splash)	Splash@splashysongs.com	(952) 913-1436	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
116	33	\N	2024-10-12 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	200	4	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	2	\N	\N	\N	\N	4	t	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
117	33	\N	2024-10-18 00:00:00-05	2	5	\N	18.00	\N	\N	f	NaN	1250	5	Door Deal	\N	t	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	NaN	NaN	NaN	t	t	\N	f	f	2025-01-09 20:58:10.632521-06	\N
118	33	\N	2024-10-24 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	150	4	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
113	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	15.00	\N	\N	f	DIYrt Pile	~$50	\N	Door Deal	t	t	\N	\N	\N	Independent 	Kara Hageman	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	4	3	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	graham findell	8maharg8@gmail.com	(763) 370-4447	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
114	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	\N	\N	\N	f	NaN	60	\N	NaN	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	4	f	t	f	\N	\N	\N	\N	NaN	\N	Katie	Katiedrahos@gmail.com	(425) 205-9164	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
120	34	\N	2024-05-04 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$300	1	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	\N	NaN	\N	checked	\N	\N	\N	\N	\N	1	f	f	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
121	34	\N	2024-09-25 00:00:00-05	3	2	\N	\N	\N	\N	f	NaN	44	4	Door Deal	\N	t	\N	\N	4	Independent 	NaN	\N	\N	f	NaN	f	\N	\N	5	\N	t	f	NaN	\N	\N	4	NaN	\N	NaN	3	\N	\N	\N	\N	4	t	t	NaN	\N	Alex Schaaf	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
122	34	\N	2024-10-31 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	85.93	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	4	\N	\N	\N	\N	4	t	t	NaN	\N	Bryn Battani	brynbattani@icloud.com	(678) 800-2181	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
123	34	\N	2024-11-02 00:00:00-05	3	5	\N	15.00	\N	20	f	NaN	165.00	4	Door Deal	\N	t	\N	\N	5	Independent 	NaN	\N	t	\N	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	3	NaN	t	NaN	3	f	t	f	\N	4	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
124	34	\N	2024-11-22 00:00:00-06	4	5	\N	22.00	\N	\N	f	NaN	451.03	4	NaN	\N	t	\N	\N	3	NaN	NaN	\N	t	\N	NaN	f	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	NaN	3	\N	\N	\N	\N	4	t	t	NaN	\N	Bailey Cogan	baileycogan26@gmail.com	(651) 757-8357	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
125	34	\N	2024-12-06 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	388.08	3	Door Deal	\N	t	\N	\N	5	NaN	NaN	\N	t	\N	NaN	\N	\N	\N	4	f	t	f	NaN	\N	\N	5	NaN	t	NaN	2	f	t	f	\N	4	t	t	NaN	\N	Molly Brandt	Mollybrandtmusic@gmail.com	(612) 655-2666	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
126	35	\N	2024-11-04 00:00:00-06	4	4	\N	15.00	\N	\N	f	NaN	$65	4	NaN	\N	t	\N	\N	4	Independent 	NaN	\N	t	f	NaN	f	\N	\N	4	t	t	f	NaN	\N	\N	4	NaN	f	NaN	3	f	f	f	\N	4	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
128	35	\N	2024-12-31 00:00:00-06	11	5	\N	10.00	\N	0	f	NaN	521	5	Door Deal	\N	t	\N	\N	5	Independent 	It was booked by Undercurrent and hosted at the show	\N	t	\N	NaN	f	\N	\N	4	t	t	f	NaN	\N	\N	4	NaN	f	NaN	5	f	f	f	\N	5	t	t	NaN	\N	Brandon Evilla	cheapbouquetmpls@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
133	36	\N	2024-10-03 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	66	4	NaN	\N	\N	\N	\N	1	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	3	\N	\N	\N	\N	3	t	t	NaN	\N	bailey	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
134	36	\N	2024-10-03 00:00:00-05	3	4	\N	\N	\N	\N	f	NaN	65.30	4	Door Deal	\N	t	\N	\N	1	NaN	NaN	\N	t	f	NaN	f	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	Decent	t	NaN	3	f	f	f	\N	4	t	t	NaN	\N	Alex schaaf	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
135	36	\N	2024-11-13 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$30	3	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	3	\N	\N	\N	\N	3	t	f	NaN	\N	NaN	NaN	NaN	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
127	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	10.00	\N	\N	f	NaN	65	\N	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	\N	NaN	\N	checked	\N	\N	\N	\N	\N	\N	t	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
138	37	\N	2024-08-09 00:00:00-05	6	4	\N	\N	\N	\N	f	NaN	Unsure	\N	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	2	t	t	f	NaN	\N	\N	5	NaN	\N	checked	3	\N	\N	\N	\N	2	t	\N	NaN	\N	Rachael	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
129	\N	\N	2025-01-09 20:58:10.632521-06	6	4	\N	8.00	\N	\N	f	NaN	65.	\N	Door Deal	t	t	\N	\N	\N	Independent 	ME (Katie Drahos	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
130	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	10.00	\N	\N	f	NaN	$65	\N	Door Deal	t	f	\N	\N	\N	Independent 	no direct communication with booker	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	4	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Syd Casey	casey.sydney@gmail.com	(863) 224-4758	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
131	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	8.00	\N	\N	f	NaN	$66	\N	Door Deal	\N	f	\N	\N	\N	Independent 	NaN	\N	t	\N	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	3	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
132	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	5.00	\N	\N	f	The Knotties residency	$30	\N	Door Deal	t	t	\N	\N	\N	Independent 	Alex Walsh	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	Promo	\N	Channing	Channingminnema@gmail.com	(727) 410-2225	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
139	37	\N	2024-12-07 00:00:00-06	3	3	\N	10.00	\N	0	f	NaN	106	5	Door Deal	\N	t	\N	\N	5	Independent 	Christy Costello	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	4	House kit is legit, bass amp is decent but small	t	NaN	5	f	f	f	\N	5	t	t	NaN	\N	Jacob West	modernwildlifeband@gmail.com	(612) 280-0349	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
140	38	\N	2024-11-12 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$600	3	Guarantee	\N	t	\N	\N	4	Independent 	Jessica Paxton 	\N	\N	f	NaN	f	\N	\N	5	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	5	\N	t	t	\N	5	t	\N	NaN	\N	xina	xinamgmt@gmail.com	(612) 810-0328	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
136	\N	\N	2025-01-09 20:58:10.632521-06	6	5	\N	15.00	\N	\N	f	NaN	$204.16	\N	Door Deal	t	t	\N	\N	\N	Independent 	Mary Jam	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	4	f	t	f	\N	\N	\N	\N	NaN	\N	Xochi de la Luna	xochidelaluna@gmail.com	(612) 220-1943	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
137	\N	\N	2025-01-09 20:58:10.632521-06	4	2	\N	5.00	\N	\N	f	NaN	0	\N	Door Deal	f	f	\N	\N	\N	Independent 	NaN	\N	t	\N	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
145	25	\N	2024-08-31 00:00:00-05	\N	4	\N	10.00	\N	\N	f	NaN	72	4	Door Deal	\N	t	\N	\N	5	Independent 	Me! (Andrea)	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	4	See above	t	NaN	5	t	t	f	\N	4	t	t	NaN	\N	Andrea Leonard	Delicatefriendmusic@gmail.com	(651) 403-3344	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
147	25	\N	2024-09-20 00:00:00-05	\N	\N	\N	\N	\N	3	f	NaN	590	3	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	f	t	f	NaN	\N	\N	5	NaN	t	checked	5	\N	t	f	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
148	25	\N	2024-11-01 00:00:00-05	4	4	\N	\N	\N	\N	f	NaN	750$	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	3	\N	\N	\N	\N	5	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
141	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	10.00	\N	\N	f	NaN	$200	\N	Door Deal	t	t	\N	\N	\N	Independent 	Juno Parsons	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	1	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	Nadirah McGill	gullyboysband@gmail.com	(612) 806-9363	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
142	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	10.00	\N	\N	f	NaN	20$	\N	Door Deal	f	t	\N	\N	\N	Independent 	Unknown	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	NaN	t	NaN	3	f	t	f	\N	\N	\N	\N	Promotion, pre show breakdown	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
143	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	\N	\N	\N	f	NaN	56	\N	Door Deal	f	t	\N	\N	\N	Independent 	NaN	\N	t	\N	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	1	t	NaN	4	f	t	f	\N	\N	\N	\N	NaN	\N	Dan DeMarco	itsadmiralfox@gmail.com	(484) 653-8922	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
144	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	10.00	\N	\N	f	NaN	$58 band $19 each	\N	Door Deal	t	t	\N	\N	\N	NaN	NaN	\N	t	\N	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	2	NaN	t	NaN	5	f	t	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
149	26	\N	2024-10-25 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$25	5	NaN	\N	\N	\N	\N	2	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	3	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	2	\N	\N	\N	\N	2	f	f	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
150	26	\N	2024-10-25 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$25	5	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	1	\N	\N	\N	\N	4	t	\N	NaN	\N	Vaughn Paradise 	alicesescapeband@gmail.com	(612) 305-8017	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
151	26	\N	2024-10-25 00:00:00-05	8	5	\N	\N	\N	\N	f	NaN	Don't quite remember, but we were happy with the compensation.	5	Door Deal	\N	\N	\N	\N	5	Independent 	Eric (vocalist of Fragged Out) booked us.	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	5	NaN	t	NaN	5	t	f	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
152	53	\N	2024-10-25 00:00:00-05	1	7	\N	\N	\N	\N	f	NaN	585	5	Guarantee	\N	t	\N	\N	5	Independent 	NaN	\N	t	f	NaN	f	\N	\N	5	\N	t	f	NaN	\N	\N	5	NaN	t	NaN	5	f	f	f	\N	5	t	t	NaN	\N	Sunshine Parker	nightwalkersmusic@gmail.com	(651) 303-7098	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
155	54	\N	2024-08-03 00:00:00-05	1	7	\N	\N	\N	\N	f	NaN	478	3	Guarantee	\N	t	\N	\N	2	Independent 	NaN	\N	t	f	NaN	f	\N	\N	5	\N	t	f	NaN	\N	\N	5	NaN	f	NaN	5	\N	f	f	\N	4	t	t	NaN	\N	Sunshine Parker	nightwalkersmusic@gmail.com	(651) 303-7098	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
93	20	\N	2024-10-25 00:00:00-05	4	4	\N	15.00	\N	\N	f	NaN	60	3	Door Deal	\N	f	\N	\N	3	Independent 	NaN	\N	\N	f	NaN	f	\N	\N	3	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	3	\N	\N	\N	\N	3	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
153	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	10.00	\N	\N	f	NaN	$35 (given to touring act)	\N	Door Deal	t	t	\N	\N	\N	Independent 	New Confusion	\N	\N	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	3	2	t	NaN	3	f	t	f	\N	\N	\N	\N	NaN	\N	graham findell	8maharg8@gmail.com	(763) 370-4447	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
154	\N	\N	2025-01-09 20:58:10.632521-06	4	4	\N	10.00	\N	\N	f	NaN	We gave our cut to the tour bands but I think it would have been 120ish per band 	\N	Door Deal	t	t	\N	\N	\N	Independent 	Unsure	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	4	4	t	NaN	\N	f	f	f	\N	\N	\N	\N	Wasn’t the most timely of emails but they are dealing with a lot over there so I get it	\N	Anita bauer	Anitavelv33ta@gmail.com	(612) 296-7642	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
159	44	\N	2024-10-26 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$120	4	Door Deal	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	3	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	3	\N	\N	\N	\N	3	\N	\N	NaN	\N	Rachael G	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
161	16	\N	2024-10-24 00:00:00-05	2	7	\N	\N	\N	\N	f	NaN	888.90 (total, then split between two bands)	5	Door Deal	\N	t	\N	\N	5	Independent 	Mary Brabec	\N	t	t	60 miles / 2 months 	f	\N	\N	5	f	t	f	NaN	\N	\N	5	Hilariously one of the mics was an old donated mic, and the sound tech was like “let me get you our NICE 58” - which made a difference! Appreciate that the cedar is punk rock / scrappy, but also attentive 	t	NaN	5	f	t	f	\N	5	t	t	NaN	\N	Emily Kastrul / Sister Species	Sisterspecies@gmail.com	(612) 708-1630	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
157	\N	\N	2025-01-09 20:58:10.632521-06	1	5	\N	0.00	\N	\N	f	Summer concert series 	$1,750	\N	Guarantee	t	t	\N	\N	\N	Agent	Hannah Vogel 	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	f	NaN	5	f	t	t	\N	\N	\N	\N	NaN	\N	Peter miller 	wearethethillows@gmail.com	(651) 216-1585	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
29	46	\N	2024-06-30 00:00:00-05	2	1	\N	12.00	\N	0	f	NaN	100	3	Guarantee	\N	f	\N	\N	4	Independent 	Beau Farmer	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	5	NaN	f	NaN	4	f	f	f	\N	4	t	t	NaN	\N	Mattie Rynkiewicz	matthewrynk@gmail.com	(612) 720-5656	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
164	46	\N	2024-09-11 00:00:00-05	4	\N	\N	\N	\N	\N	f	NaN	900.52	5	Door Deal	\N	t	\N	\N	5	Independent 	Dylan Hilaker	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	5	NaN	t	NaN	4	\N	t	\N	\N	5	t	t	NaN	\N	hilary james	hillajames@gmail.com	(303) 905-0968	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
160	\N	\N	2025-01-09 20:58:10.632521-06	5	4	\N	25.00	\N	\N	f	NaN	nan	\N	Fundraiser	t	f	\N	\N	\N	Independent 	TCTMA	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	4	4	t	NaN	5	f	t	t	\N	\N	\N	\N	NaN	\N	graham findell	8maharg8@gmail.com	(763) 370-4447	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
165	46	\N	2024-10-25 00:00:00-05	5	7	\N	15.00	\N	\N	f	NaN	2205	3	Door Deal	\N	t	\N	\N	5	Independent 	Dylan	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	4	Drum hardware of the house kit is poopy	t	NaN	4	f	t	f	\N	4	t	t	NaN	\N	Dante Leyva	dante.leyva.lundberg@gmail.com	(612) 385-2336	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
167	28	\N	2024-03-28 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	nothing	1	NaN	\N	\N	\N	\N	1	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	2	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	1	\N	\N	\N	\N	2	f	f	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
168	28	\N	2024-07-15 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	60	1	NaN	\N	\N	\N	\N	1	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	1	\N	\N	\N	\N	1	f	\N	NaN	\N	NaN	NaN	NaN	\N	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
169	28	\N	2024-10-02 00:00:00-05	3	7	\N	\N	\N	0	f	NaN	0	3	NaN	\N	\N	\N	\N	2	NaN	NaN	\N	t	\N	NaN	\N	\N	\N	5	f	t	f	NaN	\N	\N	1	NaN	t	NaN	2	f	f	f	\N	2	f	f	NaN	\N	Sunshine Parker	nightwalkersmusic@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
170	28	\N	2024-10-17 00:00:00-05	3	1	\N	\N	\N	1	f	NaN	$65	3	Door Deal	\N	t	\N	\N	2	Independent 	Madeleine Kelson - touring musician	\N	t	f	NaN	f	\N	\N	3	f	t	f	NaN	\N	\N	4	Really good sound system and lovely sound tech	f	NaN	1	f	f	f	\N	3	f	f	NaN	\N	Carter Hogan	creekbedcarter@gmail.com	(503) 484-5324	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
172	47	\N	2024-07-05 00:00:00-05	3	3	\N	15.00	\N	\N	f	NaN	150	3	Door Deal	\N	t	\N	\N	5	Independent 	Simon Calder	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	5	Good	t	NaN	5	f	f	f	\N	5	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
119	33	\N	2024-10-19 00:00:00-05	2	4	\N	\N	\N	\N	f	NaN	$150	4	NaN	\N	\N	\N	\N	4	Independent 	Corinne Couette 	\N	t	\N	NaN	\N	\N	\N	4	\N	t	f	NaN	\N	\N	3	NaN	\N	NaN	3	\N	\N	\N	\N	4	t	t	NaN	\N	Rachael G	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
184	48	\N	2024-09-06 00:00:00-05	3	5	\N	0.00	\N	\N	f	NaN	349.99	3	Guarantee	\N	t	\N	\N	3	Independent 	Laura	\N	t	f	NaN	f	\N	\N	4	f	t	f	NaN	\N	\N	4	NaN	f	NaN	3	f	f	f	\N	4	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
185	48	\N	2024-09-27 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	66.00	4	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	5	\N	\N	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
156	42	\N	2024-11-13 00:00:00-06	3	5	\N	\N	\N	\N	f	NaN	70	5	NaN	\N	\N	\N	\N	5	Independent 	JT	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	5	Great	t	NaN	5	f	t	f	\N	5	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
171	\N	\N	2025-01-09 20:58:10.632521-06	4	5	\N	\N	\N	\N	f	NaN	$386.10 Total / 96.53 per band 	\N	Door Deal	t	t	\N	\N	\N	Independent 	Joe Holland	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	4	5	f	NaN	1	f	t	f	\N	\N	\N	\N	NaN	\N	Maddie Thies	maddiejthies@gmail.com	(612) 323-3768	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
76	17	\N	2024-11-16 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$50	3	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	4	t	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
67	3	\N	2024-11-16 00:00:00-06	3	4	\N	15.00	\N	\N	f	NaN	200	5	Guarantee	\N	f	\N	\N	4	Independent 	Gina	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	4	NaN	f	NaN	4	f	t	f	\N	5	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
174	\N	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	nan	\N	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	\N	NaN	\N	checked	\N	\N	\N	\N	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
175	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	0.00	\N	\N	f	NaN	100 (67 cut of guarantee+tips)	\N	Guarantee	t	t	\N	\N	\N	Independent 	Laura Wesley Williams	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	3	3	f	NaN	\N	f	f	f	\N	\N	\N	\N	Communication and promo	\N	Rachael 	guertinrachael@gmail.com	(651) 279-7775	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
176	\N	\N	2025-01-09 20:58:10.632521-06	3	4	\N	0.00	\N	\N	f	NaN	$75	\N	Guarantee	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	3	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	laura	theband.kiernan@gmail.com	(917) 340-1375	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
177	\N	\N	2025-01-09 20:58:10.632521-06	3	5	\N	0.00	\N	\N	f	NaN	65	\N	Guarantee	t	f	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Dante	dante.leyva.lundberg@gmail.com	(612) 385-2336	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
178	\N	\N	2025-01-09 20:58:10.632521-06	2	4	\N	0.00	\N	\N	f	NaN	70	\N	Guarantee	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
179	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	\N	\N	\N	f	NaN	75	\N	Guarantee	t	t	\N	\N	\N	Independent 	Not your baby	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	3	f	NaN	\N	f	f	f	\N	\N	\N	\N	It was good 	\N	Holden Perron	Holdenperron05@gmail.com	(507) 508-0118	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
180	\N	\N	2025-01-09 20:58:10.632521-06	3	5	\N	0.00	\N	\N	f	NaN	70 (guarantee + tips)	\N	Guarantee	t	t	\N	\N	\N	Independent 	Chris	\N	t	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	5	4	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Beatrice Ogeh	beatriceogeh@icloud.com	(651) 434-5068	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
181	\N	\N	2025-01-09 20:58:10.632521-06	3	\N	\N	0.00	\N	\N	f	NaN	150	\N	Guarantee	f	t	\N	\N	\N	Independent 	Laura	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	f	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	f	f	f	2025-01-09 20:58:10.632521-06	\N
182	\N	\N	2025-01-09 20:58:10.632521-06	2	4	\N	0.00	\N	\N	f	NaN	Tips	\N	Free Show (Tip based)	t	\N	\N	\N	\N	NaN	NaN	\N	t	\N	NaN	f	\N	\N	\N	\N	\N	\N	NaN	\N	\N	5	5	\N	NaN	\N	\N	\N	\N	\N	\N	\N	\N	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
183	\N	\N	2025-01-09 20:58:10.632521-06	3	6	\N	\N	\N	\N	f	NaN	$200	\N	Guarantee	f	t	\N	\N	\N	Independent 	Bri	\N	t	f	NaN	f	\N	\N	\N	t	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	f	\N	\N	\N	\N	NaN	\N	Jake Schultz	Jakeschultzar@gmail.com	(612) 990-1137	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
68	3	\N	2024-11-10 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$100	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	Bluntwitch :)	Bluntwitchmgmt@gmail.com	(612) 388-2046	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
34	1	\N	2024-08-22 00:00:00-05	\N	\N	\N	15.00	\N	5	f	NaN	203	3	Door Deal	\N	t	\N	\N	5	NaN	Dylan	\N	t	\N	NaN	f	\N	\N	5	\N	t	f	NaN	\N	\N	5	NaN	t	NaN	4	t	t	f	\N	5	t	t	NaN	\N	Peter miller 	wearethewillows@gmail.com	(651) 216-1585	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
35	1	\N	2024-09-04 00:00:00-05	4	4	\N	15.00	\N	2	f	NaN	146	4	Other (please explain)	\N	t	\N	\N	5	NaN	Dylan	\N	t	\N	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	3	NaN	t	NaN	3	f	t	f	\N	4	t	t	NaN	\N	Alex Schaaf	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
36	1	\N	2024-09-04 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	584.00	4	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	4	\N	\N	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
37	1	\N	2024-09-04 00:00:00-05	4	4	\N	\N	\N	\N	f	NaN	$145	2	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	f	\N	NaN	\N	\N	\N	3	t	\N	t	Our band found the night's sound engineer to be rude and misogynistic towards the night's only (or presumably only) female performer. His behavior felt incredibly gendered. We did not feel they upheld First Ave's stated commitment to a code of conduct free of harassment. Other aspects of the venue's safety and security were fine.	\N	\N	1	Bad monitors, bad engineering	\N	NaN	\N	\N	\N	\N	\N	1	\N	\N	NaN	\N	Emily	valsonemail@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
40	1	\N	2024-12-18 00:00:00-06	\N	\N	\N	15.00	\N	\N	f	NaN	372.24	3	Door Deal	\N	t	\N	\N	4	Independent 	Dylan 	\N	f	t	NaN	f	\N	\N	4	t	t	f	NaN	\N	\N	4	NaN	t	NaN	5	\N	t	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
50	9	\N	2024-10-25 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	$101	4	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	f	NaN	f	\N	\N	5	\N	\N	\N	NaN	\N	\N	1	NaN	f	NaN	3	f	f	f	\N	4	t	\N	NaN	\N	anni	annixomusic@gmail.com	(612) 323-8671	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
196	\N	\N	2025-01-09 20:58:10.632521-06	2	4	\N	19.00	\N	\N	f	NaN	100	\N	Door Deal	f	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	3	2	f	NaN	3	f	t	f	\N	\N	\N	\N	Venue did not communicate load in/soundcheck until DOS	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
197	\N	\N	2025-01-09 20:58:10.632521-06	4	1	\N	15.00	\N	\N	f	NaN	$60	\N	Door Deal	t	t	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	\N	f	f	t	\N	\N	\N	\N	NaN	\N	Alex Bissen	IOSISdrone@gmail.com	(612) 964-2054	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
198	\N	\N	2025-01-09 20:58:10.632521-06	3	1	\N	\N	\N	\N	f	NaN	Unclear as of right now. The deal was a 90/10 split AFTER the venue recouped $500 (I'm not the show organizer) 	\N	Door Deal	t	f	\N	\N	\N	Independent 	NaN	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	5	t	NaN	4	f	t	t	\N	\N	\N	\N	Yes, I was not the lead on this one, but Michael Beatrez, of Weeping Covenant, was. He had small difficulty getting information 	\N	Taylor Donskey	taylor.james.donskey@gmail.com	(608) 792-0348	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
199	\N	\N	2025-01-09 20:58:10.632521-06	3	3	\N	15.00	\N	\N	f	NaN	$100	\N	Door Deal	t	t	\N	\N	\N	Independent 	Travis	\N	t	f	NaN	f	\N	\N	\N	f	\N	\N	NaN	\N	\N	5	4	f	NaN	4	f	t	t	\N	\N	\N	\N	More time to sound check 	\N	Knol Tate	knoltate@gmail.com	(651) 324-1957	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
51	9	\N	2024-11-29 00:00:00-06	3	1	\N	\N	\N	\N	f	NaN	93	5	Free Show (Tip based)	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	f	NaN	f	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	3	\N	\N	\N	\N	4	t	t	NaN	\N	Hilary james	Hillajames@gmail.com	(303) 905-0968	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
33	1	\N	2024-11-17 00:00:00-06	5	6	\N	\N	\N	\N	f	NaN	250	3	Door Deal	\N	t	\N	\N	5	Independent 	Dylan	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	3	NaN	t	NaN	4	f	t	f	\N	4	t	t	NaN	\N	Dante leyva	dante.leyva.lundberg@gmail.com	(612) 385-2336	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
38	1	\N	2024-01-11 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$250	5	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	3	\N	\N	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
39	1	\N	2024-11-19 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	500	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	Cindy Lawson 	cindymarie.lawson@gmail.com	NaN	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
112	1	\N	2025-01-09 20:58:10.632521-06	2	4	\N	10.00	\N	\N	f	NaN	250	4	Guarantee	\N	t	\N	\N	4	NaN	NaN	\N	t	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	4	NaN	t	NaN	3	t	t	f	\N	4	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
162	1	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	$250	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	2	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	4	t	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
166	1	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	500	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	3	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	John Ryan	Keepflyingband@gmail.com	(631) 943-8049	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
192	3	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	200	3	Guarantee	\N	t	\N	\N	5	NaN	NaN	\N	t	\N	NaN	\N	\N	\N	4	f	t	f	NaN	\N	\N	5	NaN	f	NaN	5	f	f	f	\N	5	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
208	3	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	$100	4	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
70	3	\N	2025-01-09 20:58:10.632521-06	2	7	\N	\N	\N	\N	f	NaN	600	5	Guarantee	\N	t	\N	\N	5	Independent 	Gina	\N	\N	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	3	NaN	f	checked	5	f	t	f	\N	5	t	t	NaN	\N	Sunshine Parker	nightwalkersmusic@gmail.com	(651) 303-7098	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
109	3	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	600	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
191	17	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	$50	4	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	4	\N	\N	\N	\N	4	t	t	NaN	\N	A Martyrs Dilemma	amartyrsdilemma@gmail.com	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
158	20	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	60	5	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	3	\N	\N	\N	\N	3	\N	f	NaN	\N	Bryn Battani	brynbattani@icloud.com	(678) 800-2181	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
173	33	\N	2025-01-09 20:58:10.632521-06	2	14	\N	\N	\N	\N	f	NaN	$150	4	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	t	\N	\N	NaN	\N	\N	4	NaN	t	NaN	3	\N	t	\N	\N	4	t	t	NaN	\N	Rachael G	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
146	25	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	72	4	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	3	NaN	\N	checked	3	\N	\N	\N	\N	4	\N	\N	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
190	42	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	\N	\N	\N	f	NaN	70	2	NaN	\N	\N	\N	\N	5	Independent 	NaN	\N	t	f	NaN	f	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	NaN	5	\N	\N	\N	\N	5	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
163	46	\N	2025-01-09 20:58:10.632521-06	\N	\N	\N	15.00	\N	\N	f	NaN	100	4	Door Deal	\N	t	\N	\N	5	Independent 	NaN	\N	t	\N	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	5	Good gear	f	NaN	5	f	t	f	\N	4	t	t	NaN	\N	Doyle Turner	doyle@doyleturner.com	(218) 766-8522	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
186	48	\N	2024-10-12 00:00:00-05	3	3	\N	\N	\N	\N	f	NaN	$120	5	Guarantee	\N	t	\N	\N	5	Independent 	NaN	\N	t	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	NaN	5	\N	\N	\N	\N	5	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
187	48	\N	2024-10-26 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	50	3	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
188	48	\N	2024-11-03 00:00:00-05	3	1	\N	\N	\N	\N	f	NaN	50	5	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	4	t	t	NaN	\N	Bryn Battani	brynbattani@icloud.com	(678) 800-2181	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
189	48	\N	2024-11-09 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	White squirrel paid $200 to all three bands and then we received $41 in cash tips, so 241 was distributed among three bands 	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	5	\N	\N	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
193	48	\N	2024-11-16 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	40	3	NaN	\N	\N	\N	\N	4	Independent 	N/A - collective fate asked us to play and coordinated the details 	\N	t	f	NaN	f	\N	\N	3	f	t	f	NaN	\N	\N	4	Fair quality and appropriate power for the room size 	f	NaN	3	f	f	f	\N	3	t	t	NaN	\N	Jason S	onlytimeband@gmail.com	NaN	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
194	48	\N	2024-12-12 00:00:00-06	\N	1	\N	\N	\N	\N	f	NaN	52ish	3	NaN	\N	\N	\N	\N	3	NaN	NaN	\N	f	f	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	3	prob faulty cable/di box	\N	NaN	4	\N	\N	\N	\N	4	t	t	NaN	\N	SEER	seerart777@gmail.com	(608) 436-4268	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
195	48	\N	2024-12-13 00:00:00-06	4	1	\N	0.00	\N	\N	f	NaN	$53	1	Free Show (Tip based)	\N	f	\N	\N	\N	NaN	NaN	\N	t	f	NaN	f	\N	\N	4	\N	\N	\N	NaN	\N	\N	3	NaN	f	NaN	1	f	f	f	\N	2	t	\N	NaN	\N	Hilary james	hillajames@gmail.com	(303) 905-0968	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
200	32	\N	2024-10-16 00:00:00-05	\N	\N	\N	\N	\N	\N	f	NaN	25	1	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	\N	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	4	\N	\N	\N	\N	3	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
201	32	\N	2024-10-18 00:00:00-05	4	4	\N	\N	\N	\N	f	NaN	Not sure	\N	NaN	\N	\N	\N	\N	\N	NaN	NaN	\N	t	\N	NaN	\N	\N	\N	5	f	t	f	NaN	\N	\N	2	Good house gear 	f	NaN	4	f	f	t	\N	3	t	t	NaN	\N	Alex Schaaf 	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
202	32	\N	2024-11-13 00:00:00-06	3	4	\N	\N	\N	\N	f	NaN	0	3	Door Deal	\N	f	\N	\N	2	Independent 	jane halldorson	\N	t	f	NaN	f	\N	\N	4	f	t	f	NaN	\N	\N	5	NaN	f	NaN	3	f	t	f	\N	3	t	t	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
203	32	\N	2024-11-13 00:00:00-06	3	5	\N	15.00	\N	4	f	NaN	0	3	Door Deal	\N	t	\N	\N	4	Independent 	Jane Damage	\N	t	f	NaN	f	\N	\N	5	t	t	f	NaN	\N	\N	5	Very high quality 	t	NaN	5	f	t	f	\N	4	t	t	NaN	\N	Graham M	gxmorris@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
204	32	\N	2024-11-18 00:00:00-06	4	5	\N	10.00	\N	3	f	NaN	$0	1	Other (please explain)	\N	f	\N	\N	2	Independent 	Travis Ryder	\N	t	f	NaN	f	\N	\N	5	f	t	f	NaN	\N	\N	5	NaN	f	NaN	5	f	f	t	\N	3	t	f	NaN	\N	NaN	NaN	NaN	f	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
205	55	\N	2024-01-18 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	$75 plus tips	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	4	NaN	\N	checked	3	\N	\N	\N	\N	4	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
206	55	\N	2024-10-23 00:00:00-05	1	2	\N	\N	\N	\N	f	NaN	252	3	Guarantee	\N	t	\N	\N	3	Independent 	Ricky the pub owner	\N	\N	f	NaN	f	\N	\N	4	f	t	f	NaN	\N	\N	1	NaN	f	NaN	4	f	f	f	\N	3	t	f	NaN	\N	Mattie	Rynkiewicz	matthewrynk@gmail.com	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
207	56	\N	2024-11-10 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	100 dollars	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	Mateo Walters morales 	Waltersmoralesm@gmail.com	(414) 269-7415	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
209	48	\N	2024-11-10 00:00:00-06	6	4	\N	\N	\N	\N	f	NaN	50	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	3	f	t	f	NaN	\N	\N	4	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	Auto (Major Malfunction bassist)	Deemocod@gmail.com	NaN	f	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
210	56	\N	2024-11-16 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	146	5	NaN	\N	\N	\N	\N	5	NaN	NaN	\N	\N	\N	NaN	\N	\N	\N	5	\N	\N	\N	NaN	\N	\N	5	NaN	\N	checked	5	\N	\N	\N	\N	5	t	t	NaN	\N	NaN	NaN	NaN	\N	\N	\N	f	f	2025-01-09 20:58:10.632521-06	\N
211	56	\N	2024-11-16 00:00:00-06	\N	\N	\N	\N	\N	\N	f	NaN	584	4	NaN	\N	\N	\N	\N	4	NaN	NaN	\N	t	\N	NaN	\N	\N	\N	4	\N	\N	\N	NaN	\N	\N	2	old but functional 	f	NaN	4	f	t	f	\N	3	t	f	NaN	\N	Andie	eudaemonband@gmail.com	NaN	\N	\N	t	f	f	2025-01-09 20:58:10.632521-06	\N
213	1	4	2025-01-10 11:34:51.066424-06	\N	\N	\N	\N	f	\N	f	\N	200	\N	\N	f	f	f	\N	3.9	\N	\N	f	f	f	\N	f	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	f	f	f	\N	\N	f	f	\N	\N	\N	\N	\N	f	f	f	f	f	2025-01-10 11:34:51.066424-06	2025-01-07 00:00:00-06
215	2	4	2025-01-10 11:43:41.361419-06	\N	\N	\N	\N	f	\N	f	\N	\N	\N	\N	f	f	f	\N	3	\N	\N	f	f	f	\N	f	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	f	f	f	\N	\N	f	f	\N	\N	\N	\N	\N	f	f	f	f	f	2025-01-10 11:43:41.361419-06	2025-01-01 00:00:00-06
216	4	4	2025-01-10 11:44:13.166759-06	\N	\N	\N	\N	f	\N	f	\N	\N	\N	\N	f	f	f	\N	3	\N	\N	f	f	f	\N	f	\N	\N	3	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	\N	f	f	f	\N	\N	f	f	\N	\N	\N	\N	\N	f	f	f	f	f	2025-01-10 11:44:13.166759-06	2025-01-03 00:00:00-06
\.


--
-- Name: Show Calendar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Show Calendar_id_seq"', 4977, true);


--
-- Name: band_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.band_images_id_seq', 20, true);


--
-- Name: bands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bands_id_seq', 33, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.favorites_id_seq', 10, true);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 8, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: musicians_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.musicians_id_seq', 119, true);


--
-- Name: people_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.people_id_seq', 1, true);


--
-- Name: peoplebands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.peoplebands_id_seq', 1, false);


--
-- Name: pledges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.pledges_id_seq', 27, true);


--
-- Name: tcupbands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tcupbands_id_seq', 150, true);


--
-- Name: user_shows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.user_shows_id_seq', 1, false);


--
-- Name: user_tcupbands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.user_tcupbands_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.users_id_seq', 307, true);


--
-- Name: venues_new_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.venues_new_id_seq', 56, true);


--
-- Name: vrc_drafts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.vrc_drafts_id_seq', 1, false);


--
-- Name: vrc_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.vrc_results_id_seq', 216, true);


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

