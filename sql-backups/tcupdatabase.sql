--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Homebrew)
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
-- Name: public; Type: SCHEMA; Schema: -; Owner: musicdaddy
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO musicdaddy;

--
-- Name: set_default_time_for_pilllar(); Type: FUNCTION; Schema: public; Owner: aschaaf
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


ALTER FUNCTION public.set_default_time_for_pilllar() OWNER TO aschaaf;

--
-- Name: update_start_column(); Type: FUNCTION; Schema: public; Owner: aschaaf
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


ALTER FUNCTION public.update_start_column() OWNER TO aschaaf;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: shows; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.shows (
    event_link character varying(500),
    flyer_image text,
    id integer NOT NULL,
    start timestamp without time zone,
    venue_id integer,
    bands text
);


ALTER TABLE public.shows OWNER TO aschaaf;

--
-- Name: Show Calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public."Show Calendar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Show Calendar_id_seq" OWNER TO aschaaf;

--
-- Name: Show Calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public."Show Calendar_id_seq" OWNED BY public.shows.id;


--
-- Name: bands; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.bands (
    id integer NOT NULL,
    band character varying(255) NOT NULL,
    social_links jsonb,
    show_id integer,
    genre text,
    bandemail text,
    open_to_requests boolean DEFAULT false,
    band_size text
);


ALTER TABLE public.bands OWNER TO aschaaf;

--
-- Name: bands_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.bands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bands_id_seq OWNER TO aschaaf;

--
-- Name: bands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.bands_id_seq OWNED BY public.bands.id;


--
-- Name: people; Type: TABLE; Schema: public; Owner: aschaaf
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


ALTER TABLE public.people OWNER TO aschaaf;

--
-- Name: people_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.people_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.people_id_seq OWNER TO aschaaf;

--
-- Name: people_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.people_id_seq OWNED BY public.people.id;


--
-- Name: peoplebands; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.peoplebands (
    id integer NOT NULL,
    person_id integer,
    band_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.peoplebands OWNER TO aschaaf;

--
-- Name: peoplebands_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.peoplebands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.peoplebands_id_seq OWNER TO aschaaf;

--
-- Name: peoplebands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.peoplebands_id_seq OWNED BY public.peoplebands.id;


--
-- Name: show_bands; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.show_bands (
    show_id integer NOT NULL,
    band_id integer NOT NULL
);


ALTER TABLE public.show_bands OWNER TO aschaaf;

--
-- Name: tcupbands; Type: TABLE; Schema: public; Owner: aschaaf
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
    images text[],
    profile_image character varying(255),
    music_links jsonb
);


ALTER TABLE public.tcupbands OWNER TO aschaaf;

--
-- Name: tcupbands_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.tcupbands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tcupbands_id_seq OWNER TO aschaaf;

--
-- Name: tcupbands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.tcupbands_id_seq OWNED BY public.tcupbands.id;


--
-- Name: venues; Type: TABLE; Schema: public; Owner: aschaaf
--

CREATE TABLE public.venues (
    id integer NOT NULL,
    venue character varying(100),
    location character varying(150),
    capacity text,
    cover_image text
);


ALTER TABLE public.venues OWNER TO aschaaf;

--
-- Name: venues_id_seq; Type: SEQUENCE; Schema: public; Owner: aschaaf
--

CREATE SEQUENCE public.venues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venues_id_seq OWNER TO aschaaf;

--
-- Name: venues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aschaaf
--

ALTER SEQUENCE public.venues_id_seq OWNED BY public.venues.id;


--
-- Name: bands id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.bands ALTER COLUMN id SET DEFAULT nextval('public.bands_id_seq'::regclass);


--
-- Name: people id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.people ALTER COLUMN id SET DEFAULT nextval('public.people_id_seq'::regclass);


--
-- Name: peoplebands id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.peoplebands ALTER COLUMN id SET DEFAULT nextval('public.peoplebands_id_seq'::regclass);


--
-- Name: shows id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.shows ALTER COLUMN id SET DEFAULT nextval('public."Show Calendar_id_seq"'::regclass);


--
-- Name: tcupbands id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.tcupbands ALTER COLUMN id SET DEFAULT nextval('public.tcupbands_id_seq'::regclass);


--
-- Name: venues id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.venues ALTER COLUMN id SET DEFAULT nextval('public.venues_id_seq'::regclass);


--
-- Data for Name: bands; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.bands (id, band, social_links, show_id, genre, bandemail, open_to_requests, band_size) FROM stdin;
\.


--
-- Data for Name: people; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.people (id, name, email, bio, profile_photo, created_at, updated_at) FROM stdin;
1	Alex Schaaf	alex.schaaf@gmail.com	Person of interest	\N	2024-12-04 18:04:46.237483	2024-12-04 18:04:46.237483
\.


--
-- Data for Name: peoplebands; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.peoplebands (id, person_id, band_id, created_at) FROM stdin;
\.


--
-- Data for Name: show_bands; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.show_bands (show_id, band_id) FROM stdin;
\.


--
-- Data for Name: shows; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.shows (event_link, flyer_image, id, start, venue_id, bands) FROM stdin;
https://whitesquirrelbar.com/event/the-bored-w-the-deeper-kind/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	2982	2024-12-14 18:00:00	297	The Bored, The Deeper Kind
https://whitesquirrelbar.com/event/lords-of-the-universe-w-home-team-quarterback-alpine-shepherd-boy/	https://whitesquirrelbar.com/wp-content/uploads/image_6483441-2-1.jpg	2983	2024-12-11 21:00:00	297	Lords of the Universe, Home Team Quarterback, Alpine Shepherd Boy
https://whitesquirrelbar.com/event/bingo-with-pete-2/	https://whitesquirrelbar.com/wp-content/uploads/IMG_9883-1.jpeg	2984	2024-12-15 18:00:00	297	Bingo With Pete!
https://whitesquirrelbar.com/event/calla-mae-w-lydia-ray-gun-youth-hot-bagels/	https://whitesquirrelbar.com/wp-content/uploads/9B7FB11D-41FB-49FE-9DE0-7421C73E3D31.jpeg	2985	2024-12-05 21:00:00	297	Calla Mae, Lydia, Ray Gun Youth, Hot Bagels
https://whitesquirrelbar.com/event/dl4-w-special-guests/	https://whitesquirrelbar.com/wp-content/uploads/12-10-24-Square.jpg	2986	2024-12-10 18:00:00	297	DL4, Special Guest Cole Diamond
https://whitesquirrelbar.com/event/edith-head-w-hot-press-mean-magic/	https://whitesquirrelbar.com/wp-content/uploads/IMG_1248.jpg	2987	2024-12-07 21:00:00	297	Edith Head, Hot Press, Mean Magic
https://whitesquirrelbar.com/event/jerrika-mighelle/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	2988	2024-12-05 18:00:00	297	Jerrika Mighelle
https://whitesquirrelbar.com/event/doug-collins-w-laura-hugo/	https://whitesquirrelbar.com/wp-content/uploads/White-Squirrel.jpg	2989	2024-12-14 13:00:00	297	Doug Collins, Charlie & Rob
https://whitesquirrelbar.com/event/lost-island-society-w-fairooz-nazifa-fumbler/	https://whitesquirrelbar.com/wp-content/uploads/IMG_2679-1.png	2990	2024-12-09 21:00:00	297	Lost Island Society, Fairooz Nazifa, Fumbler
https://whitesquirrelbar.com/event/blue-earth-collective/	https://whitesquirrelbar.com/wp-content/uploads/BEC_Logo_RGB-raster-scaled.jpg	2991	2024-12-16 18:00:00	297	Blue Earth Collective
https://whitesquirrelbar.com/event/serf-revolt-w-the-dirty-pretty/	https://whitesquirrelbar.com/wp-content/uploads/SR-Flyer.jpg	2992	2024-12-08 20:00:00	297	Serf Revolt, The Dirty Pretty
https://whitesquirrelbar.com/event/the-new-havoline-supremes-8/	https://whitesquirrelbar.com/wp-content/uploads/NewHavolineSupremeslogo.jpg	2993	2024-12-17 18:00:00	297	The New Havoline Supremes
https://whitesquirrelbar.com/event/chris-holm/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	2994	2024-12-12 18:00:00	297	Chris Holm
https://whitesquirrelbar.com/event/izzy-cruz-w-willing-done/	https://whitesquirrelbar.com/wp-content/uploads/Willingdone_12-10_WS_portrait.png	2995	2024-12-10 21:00:00	297	Izzy Cruz, Willing Done, Woodzen
https://whitesquirrelbar.com/event/wolves-of-hubbard-ep-release-show-w-sun-patches-ruben/	https://whitesquirrelbar.com/wp-content/uploads/IMG_6724.jpeg	2996	2024-12-14 21:00:00	297	Wolves Of Hubbard EP release show, Sun Patches, Ruben
https://whitesquirrelbar.com/event/carlaoke/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	2997	2024-12-15 21:00:00	297	KARAOKE!!!
https://whitesquirrelbar.com/event/hunny-bear-w-emerson-island-heliocene/	https://whitesquirrelbar.com/wp-content/uploads/WHITE-SQUIRREL-DEC-6th.png	2998	2024-12-06 21:00:00	297	Hunny Bear, Emerson Island, Heliocene
https://whitesquirrelbar.com/event/absolutely-yours-w-real-numbers-true-lust/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	2999	2024-12-13 21:00:00	297	Absolutely Yours, Real Numbers, True Lust
https://whitesquirrelbar.com/event/mumblin-drews-oldfangled-orchestrators-4/	https://whitesquirrelbar.com/wp-content/uploads/mumblindrews.jpg	3000	2024-12-09 18:00:00	297	Mumblin' Drew's Oldfangled Orchestrators
https://whitesquirrelbar.com/event/ear-candy/	https://whitesquirrelbar.com/wp-content/uploads/Ear-Candy-Vol-9-1080px-JPEG.jpg	3001	2024-12-07 18:00:00	297	Ear Candy Vol. 9: Live Electronic Music Series
https://whitesquirrelbar.com/event/nono-w-asteroid-somewhere-nice-someday/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	3002	2024-12-12 21:00:00	297	NoNo, Asteroid, Somewhere Nice, Someday
https://whitesquirrelbar.com/event/celebrating-the-music-of-tom-waits/	https://whitesquirrelbar.com/wp-content/uploads/tom-waits-scaled.jpg	3003	2024-12-04 21:00:00	297	Celebrating the Music of Tom Waits
https://whitesquirrelbar.com/event/the-gated-community-w-paperbacks/	https://whitesquirrelbar.com/wp-content/uploads/12_7_WhiteSquirrel_Poster_Final-scaled.jpg	3004	2024-12-07 13:00:00	297	The Gated Community, Paperbacks
https://whitesquirrelbar.com/event/ausgang-city-w-canadian-girlfriend-joey-thursday/	https://whitesquirrelbar.com/wp-content/uploads/Gig-WSB.png	3005	2024-12-16 21:00:00	297	Ausgang City, Canadian Girlfriend, Joey Thursday
https://whitesquirrelbar.com/event/devil-dodger-w-mammoth-moth/	https://whitesquirrelbar.com/wp-content/uploads/klipschimage-scaled.jpg	3006	2024-12-13 18:00:00	297	Devil Dodger, Mammoth Moth
https://whitesquirrelbar.com/event/chris-poppa-foster/	https://whitesquirrelbar.com/wp-content/uploads/white-squirrel-1.jpeg	3007	2024-12-15 13:00:00	297	Poppa Foster
https://whitesquirrelbar.com/event/rr-sundays-w-jeff-ray/	https://whitesquirrelbar.com/wp-content/uploads/RR-2nd-Sundays.png	3008	2024-12-08 13:00:00	297	R&R Sundays, Jeff Ray
https://whitesquirrelbar.com/event/molly-maher-her-disbelievers-w-special-guests-2/	https://whitesquirrelbar.com/wp-content/uploads/mollymayerres.jpeg	3009	2024-12-11 18:00:00	297	Molly Maher & Her Disbelievers, Special Guests
https://whitesquirrelbar.com/event/the-second-stringers-w-special-guests-3/	https://whitesquirrelbar.com/wp-content/uploads/the2ndstringersnewposter.jpg	3010	2024-12-04 18:00:00	297	The Second Stringers, Special Guests
https://www.facebook.com/profile.php?id=61558784060914&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3747	2024-12-21 22:00:00	251	Mind Out Of Time, Big Salt
https://first-avenue.com/event/2024-12-lo-moon/	https://first-avenue.com/wp-content/uploads/2024/04/LoMoon-120124-1080.jpg	3041	2024-12-01 20:00:00	252	Lo Moon, Mayfly Moon
https://first-avenue.com/event/2024-12-choir-choir-choir/	https://first-avenue.com/wp-content/uploads/2024/09/ChoirChoirChoir-120124-1080.jpg	3042	2024-12-01 20:00:00	269	Choir! Choir! Choir!
https://whitesquirrelbar.com/event/inside-llewyn-davis/	https://whitesquirrelbar.com/wp-content/uploads/image_123650291-6.jpg	2981	2024-12-06 18:00:00	297	Inside Llewyn Davis
https://www.facebook.com/profile.php?id=61557848086888&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3748	2024-12-22 19:00:00	251	The Real Chuck NORAD
https://www.facebook.com/pages/Lenz-and-Frenz/1515949742024571	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3805	2025-01-29 21:30:00	251	Lenz & Frenz, (Certain members of Pert Near Sandstone, Farmhouse Band, San Souci Quartet, Row of Ducks)
https://first-avenue.com/event/2024-12-billy-woods-and-kenny-segal/	https://first-avenue.com/wp-content/uploads/2024/08/BillyWoodsKennySegal-120224-1080v1.jpg	3044	2024-12-02 20:00:00	269	billy woods, Kenny Segal, ShrapKnel
https://first-avenue.com/event/2024-12-sam-greenfield/	https://first-avenue.com/wp-content/uploads/2024/08/SamGreenfield-120324-1080.jpg	3045	2024-12-03 20:00:00	291	Sam Greenfield, Wintry Elementary
https://first-avenue.com/event/2024-12-the-thing/	https://first-avenue.com/wp-content/uploads/2024/10/TheThing-120324-1080.jpg	3046	2024-12-03 20:00:00	252	The Thing, Lighter Co.
https://first-avenue.com/event/2024-12-belles/	https://first-avenue.com/wp-content/uploads/2024/08/Belles-120424-1080x1147v1.jpg	3047	2024-12-04 19:30:00	252	Belles, Trevor Martin, Monique Smaz
https://first-avenue.com/event/2024-12-greet-death/	https://first-avenue.com/wp-content/uploads/2024/10/GreetDeath-120424-1080x1558-1.jpg	3048	2024-12-04 20:00:00	291	Greet Death, Prize Horse
https://first-avenue.com/event/2024-12-blood-incantation/	https://first-avenue.com/wp-content/uploads/2024/08/BloodIncantaion-120424-1080.jpg	3049	2024-12-04 20:00:00	269	Blood Incantation, Midwife
https://first-avenue.com/event/2024-12-drew-baldridge/	https://first-avenue.com/wp-content/uploads/2024/08/DrewBaldridge-120524-1080v1.jpg	3050	2024-12-05 19:30:00	269	Drew Baldridge, Tori Martin, Dylan Wolfe
https://first-avenue.com/event/2024-12-little-fevers/	https://first-avenue.com/wp-content/uploads/2024/10/LittleFevers-120524-1080.jpg	3051	2024-12-05 19:30:00	291	Little Fevers, Pleasure Horse, Betty Won't, Echo Parlor
https://first-avenue.com/event/2024-12-bands-for-the-banned/	https://first-avenue.com/wp-content/uploads/2024/10/BandsfortheBanned-120524-1080.jpg	3052	2024-12-05 19:30:00	252	Dad Bod, WBS (Thomas Abban & L.A. Buckner), Chutes, Yonder
https://first-avenue.com/event/2024-12-mason-ramsey/	https://first-avenue.com/wp-content/uploads/2024/06/MasonRamsey-120624-1080.jpg	3053	2024-12-06 19:30:00	252	Mason Ramsey, Halle Kearns
https://first-avenue.com/event/2024-12-church-of-cash/	https://first-avenue.com/wp-content/uploads/2024/09/ChurchofCash-120624-1080.jpg	3054	2024-12-06 20:00:00	291	Church of Cash
https://first-avenue.com/event/2024-12-viva-knievel/	https://first-avenue.com/wp-content/uploads/2024/10/VivaKnievel-120624-1080x1669-1.jpg	3055	2024-12-06 20:30:00	270	Viva Knievel
https://first-avenue.com/event/2024-12-tophouse/	https://first-avenue.com/wp-content/uploads/2024/04/TopHouse-120624-1080v1.jpg	3056	2024-12-06 20:30:00	269	Tophouse, Griffin William Sherry
https://first-avenue.com/event/2024-12-dillinger-four-and-extreme-noise-records/	https://first-avenue.com/wp-content/uploads/2024/09/DillingerFour-120724-1080x1669-1.jpg	3057	2024-12-07 18:00:00	270	Dillinger Four, Home Front, Canal Irreal, Condominium, BUIO OMEGA
https://first-avenue.com/event/2024-12-nutcracker-sat/	https://first-avenue.com/wp-content/uploads/2024/08/Nutcracker-Ballet-Dec2024-1080.jpg	3058	2024-12-07 19:30:00	300	Metropolitan Ballet presentsNutcracker
https://first-avenue.com/event/2024-12-gavn/	https://first-avenue.com/wp-content/uploads/2024/06/Gavn-120724-1080v1.jpg	3060	2024-12-07 20:00:00	252	gavn!, Kate Yeager, Adam Yokum, Brompton
https://first-avenue.com/event/2024-12-joe-russos-almost-dead/	https://first-avenue.com/wp-content/uploads/2024/08/JoeRussosAlmostDead-120724-1080.jpg	3061	2024-12-07 20:00:00	279	Joe Russo's Almost Dead
https://first-avenue.com/event/2024-12-wolves-of-glendale/	https://first-avenue.com/wp-content/uploads/2024/06/WolvesofGlendale-120724-1080x1669v1.jpg	3062	2024-12-07 20:30:00	269	Wolves of Glendale, Loreweavers
https://first-avenue.com/event/2024-12-nutcracker-sun/	https://first-avenue.com/wp-content/uploads/2024/08/Nutcracker-Ballet-Dec2024-1080.jpg	3063	2024-12-08 14:00:00	300	Metropolitan Ballet presentsNutcracker
https://first-avenue.com/event/2024-12-john-lennon-tribute/	https://first-avenue.com/wp-content/uploads/2024/09/JohnLennonTribute-120824-1080-1.jpg	3064	2024-12-08 18:00:00	270	Curtiss A with a little help from his friends
https://first-avenue.com/event/2024-12-girli/	https://first-avenue.com/wp-content/uploads/2024/09/Girli-120824-1080.jpg	3065	2024-12-08 20:00:00	291	girli, Tricksy
https://first-avenue.com/event/2024-12-johnny-delaware/	https://first-avenue.com/wp-content/uploads/2024/08/JohnnyDelaware-120824-1080v1.jpg	3066	2024-12-08 20:00:00	252	Johnny Delaware, C.M.M.
https://first-avenue.com/event/2024-12-girl-in-red/	https://first-avenue.com/wp-content/uploads/2024/09/GirlInRed-121024-1080v1.jpg	3067	2024-12-10 19:30:00	279	girl in red, Sunday (1994)
https://first-avenue.com/event/2024-12-fend-admiral-fox-natl-park-srvc-and-joe-bartel/	https://first-avenue.com/wp-content/uploads/2024/10/Fend-121124-1080x1669-1.jpg	3068	2024-12-11 19:30:00	252	Fend, Admiral Fox, NATL PARK SRVC, Joe Bartel
https://first-avenue.com/event/2024-12-luminare-christmas/	https://first-avenue.com/wp-content/uploads/2024/09/LuminareChristmas-121124-1080.jpg	3069	2024-12-11 20:00:00	300	Luminare Christmas
https://first-avenue.com/event/2024-12-daphne-jane/	https://first-avenue.com/wp-content/uploads/2024/11/DaphneJane-121224-1080x1669-1.jpg	3070	2024-12-12 19:30:00	252	Daphne Jane, Ella Luna, Ava Levy, Kiernan
https://first-avenue.com/event/2024-12-the-silent-treatment-the-heavy-sixers-muun-bato-and-the-99ers/	https://first-avenue.com/wp-content/uploads/2024/11/ST_H6RS_MB_99rs-121224-1080.jpg	3071	2024-12-12 19:30:00	291	The Silent Treatment, The Heavy Sixers, Muun Bato, The 99ers
https://first-avenue.com/event/2024-12-arin-ray/	https://first-avenue.com/wp-content/uploads/2024/09/ArinRay-121224-1080.jpg	3072	2024-12-12 19:30:00	269	Arin Ray
https://first-avenue.com/event/2024-12-a-prairie-home-companion-christmas-fri/	https://first-avenue.com/wp-content/uploads/2024/07/APrairieHomeCompanion-dec2024-1080.jpg	3073	2024-12-13 19:30:00	300	A Prairie Home Companion
https://first-avenue.com/event/2024-12-tribute-to-the-replacements/	https://first-avenue.com/wp-content/uploads/2024/09/ReplacementsTribute-121324-1080x1669v2.jpg	3074	2024-12-13 19:30:00	291	A Tribute to The Replacements, The Melismatics, Emma Jeanne, JØUR, Mad Ripple Trib-Hoot for Slim
https://first-avenue.com/event/2024-12-history-that-doesnt-suck/	https://first-avenue.com/wp-content/uploads/2024/09/HistoryDoesntSuck-121324-1080.jpg	3075	2024-12-13 20:00:00	262	History That Doesn't Suck with Professor Greg Jackson
https://first-avenue.com/event/2024-12-wilco-fri/	https://first-avenue.com/wp-content/uploads/2024/09/Wilco-Dec2024-1080x1669-1.jpg	3077	2024-12-13 20:00:00	279	Wilco
https://first-avenue.com/event/2024-12-santa-rave/	https://first-avenue.com/wp-content/uploads/2024/09/SantaRave_121324-1080.jpg	3078	2024-12-13 21:00:00	269	Santa Rave ⏤ The Ultimate Holiday Themed Rave
https://first-avenue.com/event/2024-12-emo-nite/	https://first-avenue.com/wp-content/uploads/2024/10/EmoNite-121324-1080v1.jpg	3079	2024-12-13 21:00:00	270	Emo Nite, Derek Sanders (of Mayday Parade)
https://first-avenue.com/event/2024-12-heart-to-gold/	https://first-avenue.com/wp-content/uploads/2024/10/HeartToGold-121424-1080.jpg	3080	2024-12-14 19:00:00	269	Heart to Gold, Gully Boys, Gramma, Scrunchies
https://first-avenue.com/event/2024-12-a-prairie-home-companion-christmas-sat/	https://first-avenue.com/wp-content/uploads/2024/07/APrairieHomeCompanion-dec2024-1080.jpg	3081	2024-12-14 19:30:00	300	A Prairie Home Companion
https://first-avenue.com/event/2024-12-the-last-revel/	https://first-avenue.com/wp-content/uploads/2024/07/TheLastRevel-121424-1080.jpg	3082	2024-12-14 20:00:00	270	The Last Revel, Two Runner
https://first-avenue.com/event/2024-12-martin-zellar/	https://first-avenue.com/wp-content/uploads/2024/09/MartinZellar-121424-1080.jpg	3083	2024-12-14 20:00:00	291	Martin Zellar, LAAMAR
https://first-avenue.com/event/2024-12-basic/	https://first-avenue.com/wp-content/uploads/2024/09/Basic-121424-1080v1.jpg	3084	2024-12-14 20:00:00	252	BASIC: Chris Forsyth, Douglas McCombs, Mikel Patrick Avery, Yr Knives, American Cream
https://first-avenue.com/event/2024-12-wilco-sat/	https://first-avenue.com/wp-content/uploads/2024/09/Wilco-Dec2024-1080x1669-1.jpg	3085	2024-12-14 20:00:00	279	Wilco
https://first-avenue.com/event/2024-12-the-rock-and-roll-playhouse/	https://first-avenue.com/wp-content/uploads/2024/09/RRPH-TaylorSwift-121524-1080.jpg	3086	2024-12-15 11:30:00	270	The Rock and Roll Playhouse, Bri & The Antiheroes
https://first-avenue.com/event/2025-12-a-skylit-drive/	https://first-avenue.com/wp-content/uploads/2024/09/ASkylitDrive-121524-1080.jpg	3088	2024-12-15 20:00:00	252	A Skylit Drive, Odds of an Afterthought
https://first-avenue.com/event/2024-12-wilco-sun/	https://first-avenue.com/wp-content/uploads/2024/09/Wilco-Dec2024-1080x1669-1.jpg	3089	2024-12-15 20:00:00	279	Wilco
https://first-avenue.com/event/2024-12-brother-ali/	https://first-avenue.com/wp-content/uploads/2024/09/BrotherAli-121524-1080x1669v0.jpg	3090	2024-12-15 20:00:00	270	Brother Ali, Ant, Dee-1
https://first-avenue.com/event/2024-12-josh-ritter/	https://first-avenue.com/wp-content/uploads/2024/09/JoshRitter-121624-1080x1671-1.jpg	3091	2024-12-16 19:30:00	300	Josh Ritter
https://first-avenue.com/event/2024-12-moonlander/	https://first-avenue.com/wp-content/uploads/2024/10/Moonlander-barelytrev-1080-121724v2.jpg	3092	2024-12-17 19:30:00	252	MoonLander, Barely Trev, Broderick Jones, Jake Luke
https://first-avenue.com/event/2024-12-private-event-121824/	https://first-avenue.com/wp-content/uploads/2020/01/1stave_privateevent-sq_0.jpg	3093	2024-12-18 17:30:00	291	PRIVATE EVENT
https://first-avenue.com/event/2024-12-anni-xo/	https://first-avenue.com/wp-content/uploads/2024/09/AnniXO-121824-1080.jpg	3094	2024-12-18 19:30:00	252	anni xo, Anna Devine, The Penny Peaches, Dilly Dally Alley
https://first-avenue.com/event/2024-12-boney-james/	https://first-avenue.com/wp-content/uploads/2024/10/BoneyJames-121824-1080.jpg	3095	2024-12-18 20:00:00	300	Boney James
https://first-avenue.com/event/2024-12-a-charlie-brown-christmas/	https://first-avenue.com/wp-content/uploads/2024/11/CharlieBrownChristmas-121924-1080.jpg	3096	2024-12-19 19:00:00	291	Blue Ox Trio
https://first-avenue.com/event/2024-12-upright-forms-curve-in-lieu-and-unstable-shapes/	https://first-avenue.com/wp-content/uploads/2024/09/UprightForms-121924-1080.jpg	3097	2024-12-19 19:30:00	252	Upright Forms, Curve, In Lieu, Unstable Shapes
https://first-avenue.com/event/2024-12-caitlyn-smith/	https://first-avenue.com/wp-content/uploads/2024/09/CaitlynSmith-121924-1080.jpg	3098	2024-12-19 19:30:00	300	Caitlyn Smith
https://first-avenue.com/event/2024-12-the-jayhawks-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TheJayhawks-Dec2024-1080v2.jpg	3099	2024-12-20 19:30:00	300	The Jayhawks, Freedy Johnston
https://first-avenue.com/event/2024-12-rifflord/	https://first-avenue.com/wp-content/uploads/2024/10/Rifflord-122024-1080.jpg	3100	2024-12-20 20:00:00	252	RIFFLORD, MURF
https://first-avenue.com/event/2024-12-son-little/	https://first-avenue.com/wp-content/uploads/2024/07/SonLittle-122024-1080-1.jpg	3101	2024-12-20 20:00:00	254	Son Little, Kyah Bratz
https://first-avenue.com/event/2024-12-chapel-hart/	https://first-avenue.com/wp-content/uploads/2024/07/ChapelHart-122024-1080v1.jpg	3102	2024-12-20 20:00:00	269	Chapel Hart, Molly Brandt
https://first-avenue.com/event/2024-12-trailer-trash-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TrailerTrash-Dec2024-1080x1669-1.jpg	3103	2024-12-20 20:00:00	291	Trailer Trash
https://first-avenue.com/event/2024-12-hot-freaks/	https://first-avenue.com/wp-content/uploads/2024/10/HotFreaks-122124-1080x1669-1.jpg	3104	2024-12-21 19:00:00	269	Hot Freaks, Sleeping Jesus, Products Band
https://first-avenue.com/event/2024-12-extreme-noise-30th-anniversary-entry/	https://first-avenue.com/wp-content/uploads/2024/10/ExtremeNoise-122124-1080v1.jpg	3105	2024-12-21 19:30:00	252	P.L.F., Archagathus, Bodies Lay Broken, Black Market Fetus, Deterioration
https://first-avenue.com/event/2024-12-the-big-wu/	https://first-avenue.com/wp-content/uploads/2024/10/BigWu-122124-1080.jpg	3106	2024-12-21 19:30:00	270	The Big Wu, The People Brothers Band
https://first-avenue.com/event/2024-12-the-jayhawks-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TheJayhawks-Dec2024-1080v2.jpg	3107	2024-12-21 19:30:00	300	The Jayhawks, Freedy Johnston
https://first-avenue.com/event/2024-12-michael-kosta/	https://first-avenue.com/wp-content/uploads/2024/04/MichaelKosta-swing-1080x1423-1.jpg	3108	2024-12-21 20:00:00	262	Michael Kosta
https://first-avenue.com/event/2024-12-trailer-trash-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TrailerTrash-Dec2024-1080x1669-1.jpg	3109	2024-12-21 20:00:00	291	Trailer Trash
https://first-avenue.com/event/2024-12-trailer-trash-sun/	https://first-avenue.com/wp-content/uploads/2024/10/TrailerTrash-Dec2024-1080x1669-1.jpg	3110	2024-12-22 20:00:00	291	Trailer Trash
https://first-avenue.com/event/2024-12-allman-betts-family-revival/	https://first-avenue.com/wp-content/uploads/2024/07/AllmanBettsFamilyRevival_120124-1080x1669-1.jpg	3043	2024-12-01 20:00:00	301	The Allman Betts Band, Devon Allman Band, Duane Betts & Palmetto Motel
https://first-avenue.com/event/2024-12-bloodline-vinny-franco-and-the-love-channel-tarias-and-the-sound-and-the-dalmatian-club/	https://first-avenue.com/wp-content/uploads/2024/10/Bloodline-120724-1080x1669-1.jpg	3059	2024-12-07 20:00:00	291	Bloodline, Vinny Franco and the Love Channel, Tarias and the Sound, The Dalmatian Club
https://first-avenue.com/event/2024-12-illiterate-light/	https://first-avenue.com/wp-content/uploads/2024/08/IlliterateLight-121324-1080.jpg	3076	2024-12-13 20:00:00	252	Illiterate Light, Palmyra
https://first-avenue.com/event/2024-12-magic-underground/	https://first-avenue.com/wp-content/uploads/2024/10/MagicUnderground-HolidayGala-121524-1080x1669-1.jpg	3087	2024-12-15 19:00:00	291	The Magic Underground, Pizpor, Noah Sonie, Christopher Leuck, Mike Davis, Roger Wells, Lily Meyer
https://first-avenue.com/event/2024-12-the-honeydogs/	https://first-avenue.com/wp-content/uploads/2024/11/TheHoneydogs-122624-1080.jpg	3111	2024-12-26 20:00:00	291	The Honeydogs, The Penny Peaches
https://first-avenue.com/event/2024-12-all-tomorrows-petty-fri/	https://first-avenue.com/wp-content/uploads/2024/11/AllTomorrowsPetty-Dec2024-1080v1.jpg	3112	2024-12-27 21:00:00	291	All Tomorrow's Petty, Turn Turn Turn
https://first-avenue.com/event/2024-12-american-girl-doll-rave/	https://first-avenue.com/wp-content/uploads/2024/11/AGDRave-122724-1080.jpg	3113	2024-12-27 21:00:00	270	Flip Phone, Ken Doll, Frozaen Pissás, Onya Deek, Queenie von Curves, Priscilla Es Yuicy, Domita Sanchez
https://first-avenue.com/event/2024-12-jaki-blue/	https://first-avenue.com/wp-content/uploads/2024/11/JakiBlue-127224-1080.jpg	3114	2024-12-27 21:00:00	252	Jaki Blue, KAYCYY, Sophia Eris
https://first-avenue.com/event/2024-12-soul-asylum/	https://first-avenue.com/wp-content/uploads/2024/10/SoulAsylum-122824-1080v2.jpg	3115	2024-12-28 19:30:00	270	Soul Asylum, Tommy Stinson
https://first-avenue.com/event/2024-12-shrimpnose/	https://first-avenue.com/wp-content/uploads/2024/10/Shrimpnose-122824-1080v0.jpg	3116	2024-12-28 20:00:00	252	Shrimpnose, Daedelus, Wicker's Portal, TaliaKnight, student 1
https://first-avenue.com/event/2024-12-all-tomorrows-petty-sat/	https://first-avenue.com/wp-content/uploads/2024/11/AllTomorrowsPetty-Dec2024-1080v1.jpg	3117	2024-12-28 21:00:00	291	All Tomorrow's Petty, A Little Too Short To Be Stormtroopers
https://first-avenue.com/event/2024-12-qmoe/	https://first-avenue.com/wp-content/uploads/2024/11/Qmoe-122924-1080x1350v1.jpg	3118	2024-12-29 19:30:00	252	Qmoe, bdifferent, Mack OC
https://first-avenue.com/event/2024-12-devotchka/	https://first-avenue.com/wp-content/uploads/2024/09/Devotchka-122924-1080.jpg	3119	2024-12-29 20:00:00	270	DeVotchKa, Superior Siren
https://first-avenue.com/event/2024-12-transmission-nye/	https://first-avenue.com/wp-content/uploads/2024/11/NYE-Transmission-123124-1080x1669-1.jpg	3120	2024-12-31 21:00:00	270	Transmission, DJ Jake Rudh
https://first-avenue.com/event/2024-12-samambo/	https://first-avenue.com/wp-content/uploads/2024/11/Samambo-123124-1080.jpg	3121	2024-12-31 21:00:00	269	Samambo
https://first-avenue.com/event/2024-12-you-oughta-know/	https://first-avenue.com/wp-content/uploads/2024/11/YouOughtaKnow-123124-1080.jpg	3122	2024-12-31 21:00:00	252	You Oughta Know
https://first-avenue.com/event/2024-12-mae-simpson/	https://first-avenue.com/wp-content/uploads/2024/11/MaeSimpson-NYE-123124-1080.jpg	3123	2024-12-31 21:00:00	291	Mae Simpson
https://first-avenue.com/event/2025-01-landon-conrath-wk1/	https://first-avenue.com/wp-content/uploads/2024/09/LandonConrath-jan2025-1080.jpg	3207	2025-01-02 20:00:00	252	Landon Conrath
https://first-avenue.com/event/2025-01-hell-yeah-2/	https://first-avenue.com/wp-content/uploads/2024/11/HellYeah2-010325-1080x1669-1.jpg	3208	2025-01-03 19:00:00	291	Mary Lucia, DJ Shane Kramer(of Transmission), DJ Johnnie Johnson, Monica LaPlante
https://first-avenue.com/event/2025-01-the-holy-north/	https://first-avenue.com/wp-content/uploads/2024/11/TheHolyNorth-010325-1080x1669-1.jpg	3209	2025-01-03 20:00:00	252	The Holy North, The Twins of Franklin, Clayton Ryan
https://first-avenue.com/event/2025-01-wrestlepalooza-fri/	https://first-avenue.com/wp-content/uploads/2024/09/Wrestlepalooza-010325-1920x1080-1.jpg	3210	2025-01-03 20:00:00	270	F1RST Wrestling
https://first-avenue.com/event/2025-01-short-n-sabrina/	https://first-avenue.com/wp-content/uploads/2024/12/ShortnSabrina-010325-1000.jpg	3211	2025-01-03 21:00:00	269	Short n’ Sabrina: Sabrina Carpenter Party
https://first-avenue.com/event/2025-01-early-eyes/	https://first-avenue.com/wp-content/uploads/2024/11/EarlyEyes-010425-1080v1.jpg	3212	2025-01-04 20:00:00	269	Early Eyes, Killed By Kiwis, OISTER BOY
https://first-avenue.com/event/2025-01-wrestlepalooza-sat/	https://first-avenue.com/wp-content/uploads/2024/09/Wrestlepalooza-010425-1920x1080-1.jpg	3213	2025-01-04 20:00:00	270	F1RST Wrestling
https://first-avenue.com/event/2025-01-sundown47/	https://first-avenue.com/wp-content/uploads/2024/11/SunDown47-010425-1080v1.jpg	3214	2025-01-04 20:00:00	252	SunDown47, The Melismatics, Zander
https://first-avenue.com/event/2025-01-grammas-boyfriend/	https://first-avenue.com/wp-content/uploads/2024/11/GrammasBoyfriend-010425-1080x1669-1.jpg	3215	2025-01-04 20:30:00	291	Gramma's Boyfriend, Oyster World, Ghosting Merit
https://first-avenue.com/event/2025-01-charlie-parr-wk1/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	3216	2025-01-05 19:30:00	291	Charlie Parr, Jon Edwards
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk1/	https://first-avenue.com/wp-content/uploads/2024/10/CactusBlossoms-JanRes-1080.jpg	3217	2025-01-06 19:30:00	291	The Cactus Blossoms
https://first-avenue.com/event/2025-01-rosie/	https://first-avenue.com/wp-content/uploads/2024/11/rosie-010825-1080.jpg	3218	2025-01-08 19:30:00	252	rosie, Jillian Rae, bathtub cig, Bryn Battani
https://first-avenue.com/event/2025-01-landon-conrath-wk2/	https://first-avenue.com/wp-content/uploads/2024/09/LandonConrath-jan2025-1080.jpg	3219	2025-01-09 20:00:00	252	Landon Conrath
https://first-avenue.com/event/2025-01-farewell-milwaukee/	https://first-avenue.com/wp-content/uploads/2024/11/FarewellMilwaukee-010925-1080x1669-1.jpg	3220	2025-01-09 20:00:00	291	Farewell Milwaukee, A Piano In Every Home, Big Lake
https://first-avenue.com/event/2025-01-goo-goo-mucks-worlds-forgotten-boys-rudegirl/	https://first-avenue.com/wp-content/uploads/2024/11/GooGooMucks-011025-1080.jpg	3221	2025-01-10 20:00:00	291	GOO GOO MUCKS (A Tribute to The Cramps + more), The World’s Forgotten Boys (Stooges Tribute ft. members of Impaler, Dumpster Juice, ex-Satan’s Satyrs), RuDeGiRL (The Clash tribute)
https://first-avenue.com/event/2025-01-g-love-special-sauce/	https://first-avenue.com/wp-content/uploads/2024/10/GLove-011025-1080.jpg	3222	2025-01-10 20:00:00	270	G. Love & Special Sauce
https://first-avenue.com/event/2025-01-internet-kids/	https://first-avenue.com/wp-content/uploads/2024/11/InternetKids-011025-1080x1669-1.jpg	3223	2025-01-10 21:00:00	269	INTERNET KIDS ⏤ Hyperpop Dance Party, femtanyl, bejalvin
https://first-avenue.com/event/2025-01-sean-anonymous/	https://first-avenue.com/wp-content/uploads/2024/11/SeanAnonymous-011025-1080x1669-1.jpg	3224	2025-01-10 21:00:00	252	Sean Anonymous, Ceschi, Demon Marcus, student 1, Dimitry Killstorm, Diane
https://first-avenue.com/event/2025-01-big-head-todd-and-the-monsters/	https://first-avenue.com/wp-content/uploads/2024/09/BigHeadTodd-011125-1080v1.jpg	3225	2025-01-11 19:30:00	279	Big Head Todd and the Monsters, Glen Phillips (of Toad the Wet Sprocket)
https://first-avenue.com/event/2025-01-ber/	https://first-avenue.com/wp-content/uploads/2024/10/Ber-011125-1080x1669-1.jpg	3226	2025-01-11 19:30:00	270	BER
https://first-avenue.com/event/2025-01-benny-everett-with-the-best-intentions/	https://first-avenue.com/wp-content/uploads/2024/11/BennyEverett-011125-1080x1669-1.jpg	3227	2025-01-11 20:00:00	291	Benny Everett, The Gated Community
https://first-avenue.com/event/2025-01-dolly-parton-tribute/	https://first-avenue.com/wp-content/uploads/2024/11/DollyTribute-011125-1080x1669-1.jpg	3228	2025-01-11 20:00:00	269	Faith Boblett, Molly Brandt, Rachel Calvert (Barbaro), Laura Hugo, Jaedyn James, Sarah Morris, Savannah Smith, Davina Sowers (Davina & The Vagabonds), Leslie Vincent, A Little Too Short To Be Stormtroopers
https://first-avenue.com/event/2025-01-will-burkart/	https://first-avenue.com/wp-content/uploads/2024/08/WillBurkart-011125-1080.jpg	3229	2025-01-11 20:00:00	262	Will Burkart
https://first-avenue.com/event/2025-01-freak-on-a-leash-fellowship/	https://first-avenue.com/wp-content/uploads/2024/11/FreakonaLeash-011125-1080.jpg	3230	2025-01-11 21:00:00	252	Freak On A Leash Fellowship ⏤ Nu Metal Dance Party
https://first-avenue.com/event/2025-01-mayfly-moon/	https://first-avenue.com/wp-content/uploads/2024/11/MayflyMoon-011225-1080.jpg	3231	2025-01-12 19:30:00	252	Mayfly Moon, Pullstring, Lake Drive, Motherwind
https://first-avenue.com/event/2025-01-charlie-parr-wk2/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	3232	2025-01-12 19:30:00	291	Charlie Parr, Samuel Locke Ward
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk2/	https://first-avenue.com/wp-content/uploads/2024/10/CactusBlossoms-JanRes-1080.jpg	3233	2025-01-13 19:30:00	291	The Cactus Blossoms
https://first-avenue.com/event/2025-01-been-stellar/	https://first-avenue.com/wp-content/uploads/2024/10/BeenStellar-011525-1080.jpg	3234	2025-01-15 20:00:00	252	Been Stellar, Malice K
https://first-avenue.com/event/2025-01-joy-oladokun/	https://first-avenue.com/wp-content/uploads/2024/09/JoyOladokun-011625-1080.jpg	3235	2025-01-16 19:30:00	270	Joy Oladokun
https://first-avenue.com/event/2025-01-landon-conrath-wk3/	https://first-avenue.com/wp-content/uploads/2024/09/LandonConrath-jan2025-1080.jpg	3236	2025-01-16 20:00:00	252	Landon Conrath
https://first-avenue.com/event/2025-01-jukebox-the-ghost-thu/	https://first-avenue.com/wp-content/uploads/2024/10/JukeboxTheGhost-Jan2025-1080x1669-1.jpg	3237	2025-01-16 20:00:00	269	Jukebox the Ghost
https://first-avenue.com/event/2025-01-40-oz-to-freedom-sublime-tribute/	https://first-avenue.com/wp-content/uploads/2024/11/40ozToFreedom-011725-1080.jpg	3238	2025-01-17 20:00:00	291	40 Oz to Freedom (Sublime Tribute)
https://first-avenue.com/event/2025-01-jukebox-the-ghost-fri/	https://first-avenue.com/wp-content/uploads/2024/10/JukeboxTheGhost-Jan2025-1080x1669-1.jpg	3239	2025-01-17 20:00:00	269	Jukebox the Ghost
https://first-avenue.com/event/2025-01-twin-citizen/	https://first-avenue.com/wp-content/uploads/2024/11/TwinCitizen-011725-1080v0.jpg	3240	2025-01-17 20:00:00	252	Twin Citizen, AirLands, Larry Wish
https://first-avenue.com/event/2025-01-isoxo-fri/	https://first-avenue.com/wp-content/uploads/2024/10/ISOxo-Jan25-1080.jpg	3241	2025-01-17 20:30:00	270	ISOxo
https://first-avenue.com/event/2025-01-jamie-xx/	https://first-avenue.com/wp-content/uploads/2024/09/Jamiexx-011825-1080x1669-1.jpg	3242	2025-01-18 19:00:00	255	Jamie xx
https://first-avenue.com/event/2025-01-vvolf-mask-and-caustic-abyss/	https://first-avenue.com/wp-content/uploads/2024/12/VVolfMask-011825-1080x1669-1.jpg	3243	2025-01-18 19:00:00	291	VVOLF MASK, Caustic Abyss, Cobra Czar, Nekrotisk, Den of Thieves
https://first-avenue.com/event/2025-01-lutalo/	https://first-avenue.com/wp-content/uploads/2024/10/Lutalo-011825-1080.jpg	3244	2025-01-18 19:00:00	252	Lutalo
https://first-avenue.com/event/2025-01-jukebox-the-ghost-sat/	https://first-avenue.com/wp-content/uploads/2024/10/JukeboxTheGhost-Jan2025-1080x1669-1.jpg	3245	2025-01-18 20:00:00	269	Jukebox the Ghost
https://first-avenue.com/event/2025-01-happy-birthday-janis/	https://first-avenue.com/wp-content/uploads/2024/09/HappyBirthdayJanis-011825-1080.jpg	3246	2025-01-18 20:00:00	300	
https://first-avenue.com/event/2025-01-isoxo/	https://first-avenue.com/wp-content/uploads/2024/10/ISOxo-Jan25-1080.jpg	3247	2025-01-18 20:30:00	270	ISOxo
https://first-avenue.com/event/2025-01-charlie-parr-wk3/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	3248	2025-01-19 19:30:00	291	Charlie Parr, Laurel Premo
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk3/	https://first-avenue.com/wp-content/uploads/2024/10/CactusBlossoms-JanRes-1080.jpg	3249	2025-01-20 19:30:00	291	The Cactus Blossoms
https://first-avenue.com/event/2025-01-ben-barnes/	https://first-avenue.com/wp-content/uploads/2024/10/BenBarnes-012125-1080x1669v1.jpg	3250	2025-01-21 20:00:00	269	Ben Barnes, Charles Jones, Sophia James, Zoe Sparks
https://first-avenue.com/event/2025-01-the-dregs/	https://first-avenue.com/wp-content/uploads/2024/12/TheDregs-012225-1080x1669-1.jpg	3251	2025-01-22 19:00:00	252	The Dregs, Tango, SoulFlower, Yana the Mooncricket, Flores de Olivo, DJ Lemony
https://first-avenue.com/event/2025-01-tom-the-mail-man/	https://first-avenue.com/wp-content/uploads/2024/06/TomTheMailMan-012325-1080.jpg	3252	2025-01-23 19:00:00	252	Tom The Mail Man, Tahj Keeton
https://first-avenue.com/event/2025-01-the-current-20th-anniversary-fri/	https://first-avenue.com/wp-content/uploads/2024/10/CURR-20-012425-1080.jpg	3253	2025-01-24 19:30:00	270	Frank Black, she's green, DJ Jake Rudh
https://first-avenue.com/event/2025-01-christian-lee-hutson/	https://first-avenue.com/wp-content/uploads/2024/11/ChristianLeeHutson-012425-1080.jpg	3254	2025-01-24 19:30:00	252	Christian Lee Hutson, Allegra Krieger
https://first-avenue.com/event/2025-01-glaive/	https://first-avenue.com/wp-content/uploads/2024/10/Glaive-012425-1080.jpg	3255	2025-01-24 19:30:00	269	glaive
https://first-avenue.com/event/2025-01-tribute-to-the-last-waltz-fri/	https://first-avenue.com/wp-content/uploads/2024/09/TheLastWaltz-Jan2025-1080x1669-1.jpg	3256	2025-01-24 20:00:00	300	Big Pink (Last Waltz tribute), Lamont Cranston
https://first-avenue.com/event/2025-01-the-current-20th-anniversary-sat/	https://first-avenue.com/wp-content/uploads/2024/10/CURR-20-012525-1080.jpg	3257	2025-01-25 19:30:00	270	Beach Bunny, Bad Bad Hats, MAKR AN ERIS
https://first-avenue.com/event/2025-01-tribute-to-the-last-waltz-sat/	https://first-avenue.com/wp-content/uploads/2024/09/TheLastWaltz-Jan2025-1080x1669-1.jpg	3258	2025-01-25 20:00:00	300	Big Pink (Last Waltz tribute), The Belfast Cowboys
https://first-avenue.com/event/2025-01-terrapin-flyer/	https://first-avenue.com/wp-content/uploads/2024/09/TerrapinFlyer-012525-1080.jpg	3259	2025-01-25 20:00:00	291	Terrapin Flyer
https://first-avenue.com/event/2025-01-the-vaccines/	https://first-avenue.com/wp-content/uploads/2024/09/TheVaccines-012525-1080.jpg	3260	2025-01-25 20:30:00	269	The Vaccines, THUS LOVE
https://first-avenue.com/event/2025-01-charlie-parr-wk4/	https://first-avenue.com/wp-content/uploads/2024/09/CharlieParr-Jan2025-Residency-1080.jpg	3261	2025-01-26 19:30:00	291	Charlie Parr, Paper Wings
https://first-avenue.com/event/2025-01-sean-rowe/	https://first-avenue.com/wp-content/uploads/2024/10/SeanRowe-012625-1080.jpg	3262	2025-01-26 20:00:00	252	Sean Rowe
https://first-avenue.com/event/2025-01-rubblebucket/	https://first-avenue.com/wp-content/uploads/2024/09/Rubblebucket-012625-1080.jpg	3263	2025-01-26 20:00:00	254	Rubblebucket, Hannah Mohan
https://first-avenue.com/event/2025-01-the-cactus-blossoms-wk4/	https://first-avenue.com/wp-content/uploads/2024/10/CactusBlossoms-JanRes-1080.jpg	3264	2025-01-27 19:30:00	291	The Cactus Blossoms
https://first-avenue.com/event/2025-01-geordie-greep/	https://first-avenue.com/wp-content/uploads/2024/11/GeordieGreep-012725-1080-FA.jpg	3265	2025-01-27 20:00:00	270	Geordie Greep, NNAMDÏ
https://first-avenue.com/event/2025-01-the-backfires/	https://first-avenue.com/wp-content/uploads/2024/10/TheBackfires-012825-1080.jpg	3266	2025-01-28 19:00:00	252	The Backfires
https://first-avenue.com/event/2025-01-king-buffalo/	https://first-avenue.com/wp-content/uploads/2024/11/KingBuffalo-012825-1080x1669-1.jpg	3267	2025-01-28 20:00:00	291	King Buffalo, Jr Parks
https://first-avenue.com/event/2025-01-the-get-up-kids/	https://first-avenue.com/wp-content/uploads/2024/11/TheGetUpKids-012825-1080v1.jpg	3268	2025-01-28 20:00:00	269	The Get Up Kids, Smoking Popes
https://first-avenue.com/event/2025-01-burning-blue-rain/	https://first-avenue.com/wp-content/uploads/2024/12/BurningBlueRain-012925-1080.jpg	3269	2025-01-29 20:00:00	252	Burning Blue Rain, Saltydog, Lighter Co.
https://first-avenue.com/event/2025-01-tim-heidecker/	https://first-avenue.com/wp-content/uploads/2024/09/TImHeidecker-012925-1080x1424-1.jpg	3270	2025-01-29 20:00:00	270	Tim Heidecker, Neil Hamburger
https://first-avenue.com/event/2025-01-lazer-dim-700/	https://first-avenue.com/wp-content/uploads/2024/06/LazerDim700-013025-1080.jpg	3271	2025-01-30 19:30:00	252	Lazer Dim 700
https://first-avenue.com/event/2025-01-best-new-bands/	https://first-avenue.com/wp-content/uploads/2024/12/BestNewBands2024-1080x1669-1.jpg	3272	2025-01-31 19:00:00	270	Bizhiki, Christy Costello, The Dalmatian Club, Kiernan, Mati, porch light, room3
https://first-avenue.com/event/2025-01-mike-dawes/	https://first-avenue.com/wp-content/uploads/2024/09/MikeDawes-013124-1080.jpg	3273	2025-01-31 20:00:00	269	Mike Dawes
https://first-avenue.com/event/2025-01-porridge-radio/	https://first-avenue.com/wp-content/uploads/2024/08/PorridgeRadio-013125-1080v1.jpg	3274	2025-01-31 20:30:00	252	Porridge Radio, Sluice
https://first-avenue.com/event/2025-02-2hollis/	https://first-avenue.com/wp-content/uploads/2024/10/2Hollis-020125-1080x1537-1.jpg	3275	2025-02-01 19:00:00	254	2hollis
https://first-avenue.com/event/2025-02-the-dirty-nil/	https://first-avenue.com/wp-content/uploads/2024/09/TheDirtyNil-020125-1080.jpg	3276	2025-02-01 19:00:00	252	The Dirty Nil, Grumpster, House & Home
https://first-avenue.com/event/2025-02-dylan-marlowe/	https://first-avenue.com/wp-content/uploads/2024/10/DylanMarlowe-020125-1080v2.jpg	3277	2025-02-01 19:30:00	269	Dylan Marlowe, Brian Fuller
https://first-avenue.com/event/2025-02-jeremie-albino/	https://first-avenue.com/wp-content/uploads/2024/09/JeremieAlbino-020125-1080x1669-1.jpg	3278	2025-02-01 20:00:00	291	Jeremie Albino, Benjamin Dakota Rogers
https://first-avenue.com/event/2025-02-magic-city-hippies/	https://first-avenue.com/wp-content/uploads/2024/10/MagicCityHippies-020125-1080x1669-1.jpg	3279	2025-02-01 20:30:00	270	Magic City Hippies, Mustard Service
https://first-avenue.com/event/2025-02-wunderhorse/	https://first-avenue.com/wp-content/uploads/2024/09/Wunderhorse-020225-1080v1.jpg	3280	2025-02-02 20:00:00	291	Wunderhorse, Deux Visages
https://first-avenue.com/event/2025-02-michelle/	https://first-avenue.com/wp-content/uploads/2024/11/Michelle-020225-1080-FL.jpg	3281	2025-02-02 20:00:00	269	MICHELLE, Ayoni
https://first-avenue.com/event/2025-02-david-gray/	https://first-avenue.com/wp-content/uploads/2024/09/DavidGray-020325-1080.jpg	3282	2025-02-03 19:30:00	301	David Gray
https://first-avenue.com/event/2025-02-lauren-mayberry/	https://first-avenue.com/wp-content/uploads/2024/10/LaurenMayberry-020325-1080x1669-1.jpg	3283	2025-02-03 20:00:00	269	Lauren Mayberry
https://first-avenue.com/event/2025-02-donny-benet/	https://first-avenue.com/wp-content/uploads/2024/09/DonnyBenet-022525-1080.jpg	3284	2025-02-05 20:00:00	254	Donny Benét
https://first-avenue.com/event/2025-02-max-mcnown-wed/	https://first-avenue.com/wp-content/uploads/2024/09/MaxMcNown-020525-1080.jpg	3285	2025-02-05 20:00:00	252	Max McNown
https://first-avenue.com/event/2025-02-toro-y-moi-panda-bear/	https://first-avenue.com/wp-content/uploads/2024/10/ToroyMoi-020625-1080x1669-1.jpg	3286	2025-02-06 19:30:00	270	Toro y Moi, Panda Bear, Nourished By Time
https://first-avenue.com/event/2025-02-max-mcnown/	https://first-avenue.com/wp-content/uploads/2024/09/MaxMcNown-020625-1080.jpg	3287	2025-02-06 20:00:00	252	Max McNown
https://first-avenue.com/event/2025-02-the-sound-of-gospel-sat/	https://first-avenue.com/wp-content/uploads/2024/10/soundofgospel_Feb2025-1080.jpg	3288	2025-02-08 19:00:00	300	
https://first-avenue.com/event/2025-02-the-brothers-allmanac/	https://first-avenue.com/wp-content/uploads/2024/12/TheBrothersAllmanac-020825-1080x1669v0.jpg	3289	2025-02-08 20:00:00	270	The Brothers Allmanac, Slippery People (The Music of Talking Heads)
https://first-avenue.com/event/2025-02-eggy/	https://first-avenue.com/wp-content/uploads/2024/11/Eggy-020825-1080.jpg	3290	2025-02-08 20:30:00	269	Eggy
https://first-avenue.com/event/2025-02-slynk-and-phyphr/	https://first-avenue.com/wp-content/uploads/2024/12/Phyphr-Slynk-020825-1080.jpg	3291	2025-02-08 21:00:00	252	Slynk, Phyphr
https://first-avenue.com/event/2025-02-the-sound-of-gospel-sun/	https://first-avenue.com/wp-content/uploads/2024/10/soundofgospel_Feb2025-1080.jpg	3292	2025-02-09 15:00:00	300	
https://first-avenue.com/event/2025-02-070-shake/	https://first-avenue.com/wp-content/uploads/2024/11/070Shake-020925-1080v0.jpg	3293	2025-02-09 20:00:00	270	070 Shake, Bryant Barnes, Johan Lenox
https://first-avenue.com/event/2025-02-eddie-9v/	https://first-avenue.com/wp-content/uploads/2024/10/Eddie9V-021125-1080.jpg	3294	2025-02-11 20:00:00	252	Eddie 9V
https://first-avenue.com/event/2025-02-uncle-acid-the-deadbeats/	https://first-avenue.com/wp-content/uploads/2024/10/UncleAcid-021325-1080x1488-1.jpg	3295	2025-02-13 20:00:00	300	Uncle Acid & the Deadbeats, Jonathan Hultén
https://first-avenue.com/event/2025-02-rachel-grae/	https://first-avenue.com/wp-content/uploads/2024/10/RachelGrae-021425-1080.jpg	3296	2025-02-14 19:00:00	252	Rachel Grae
https://first-avenue.com/event/2025-02-eivor/	https://first-avenue.com/wp-content/uploads/2024/09/Eivor-021425-1080x1669-1.jpg	3297	2025-02-14 20:00:00	262	Eivør, Sylvaine
https://first-avenue.com/event/2025-01-sapphic-factory/	https://first-avenue.com/wp-content/uploads/2024/12/SapphicFactory-021425-1000.jpg	3298	2025-02-14 21:00:00	269	sapphic factory: queer joy party
https://first-avenue.com/event/2025-02-good-kid/	https://first-avenue.com/wp-content/uploads/2024/10/GoodKid-021525-1080.jpg	3299	2025-02-15 19:00:00	270	Good Kid, Phoneboy
https://first-avenue.com/event/2025-02-blind-pilot/	https://first-avenue.com/wp-content/uploads/2024/09/BlindPilot-021525-1080v1.jpg	3300	2025-02-15 20:00:00	269	Blind Pilot, Kacy & Clayton
https://first-avenue.com/event/2025-02-michigan-rattlers/	https://first-avenue.com/wp-content/uploads/2024/11/MichiganRattlers-021525-1080.jpg	3301	2025-02-15 20:30:00	252	Michigan Rattlers
https://first-avenue.com/event/2025-02-dua-saleh/	https://first-avenue.com/wp-content/uploads/2024/10/DuaSaleh-021625-1080x1669-1.jpg	3302	2025-02-16 19:30:00	269	Dua Saleh, Sam Austins
https://first-avenue.com/event/2025-02-benjamin-booker/	https://first-avenue.com/wp-content/uploads/2024/10/BenjaminBooker-021625-1080x1513-1.jpg	3303	2025-02-16 20:00:00	291	Benjamin Booker, Kenny Segal
https://first-avenue.com/event/2025-02-jarv/	https://first-avenue.com/wp-content/uploads/2024/09/JARV-021625-1080.jpg	3304	2025-02-16 20:00:00	252	Jarv, King Green, Damn Skippy
https://first-avenue.com/event/2025-02-jordana/	https://first-avenue.com/wp-content/uploads/2024/10/Jordana-021725-1080.jpg	3305	2025-02-17 19:00:00	252	Jordana, Rachel Bobbitt
https://first-avenue.com/event/2025-02-a-r-i-z-o-n-a/	https://first-avenue.com/wp-content/uploads/2024/10/Arizona-021925-1080v1.jpg	3306	2025-02-19 19:30:00	270	A R I Z O N A, Moody Joody
https://first-avenue.com/event/2025-02-stephen-day/	https://first-avenue.com/wp-content/uploads/2024/11/StephenDay-021925-1080.jpg	3307	2025-02-19 20:00:00	252	Stephen Day
https://first-avenue.com/event/2025-02-boombox/	https://first-avenue.com/wp-content/uploads/2024/11/BoomBox-021925-1080.jpg	3308	2025-02-19 20:00:00	269	BoomBox
https://first-avenue.com/event/2025-02-jamie-miller/	https://first-avenue.com/wp-content/uploads/2024/10/JamieMiller-022025-1080.jpg	3309	2025-02-20 19:30:00	269	Jamie Miller
https://first-avenue.com/event/2025-02-muscadine-bloodline/	https://first-avenue.com/wp-content/uploads/2024/10/MuscadineBloodline-022125-1080v1.jpg	3310	2025-02-21 20:00:00	270	Muscadine Bloodline, Lance Roark
https://first-avenue.com/event/2025-02-spin-doctors/	https://first-avenue.com/wp-content/uploads/2024/10/SpinDoctors-022225-1080.jpg	3311	2025-02-22 20:00:00	279	Spin Doctors, Aortic Fire, Gina Schock of the Go-Go’s
https://first-avenue.com/event/2025-02-ron-pope/	https://first-avenue.com/wp-content/uploads/2024/08/RonPope-022225-1080.jpg	3312	2025-02-22 20:00:00	291	Ron Pope, Andrea von Kampen
https://first-avenue.com/event/2025-02-ax-and-the-hatchetmen/	https://first-avenue.com/wp-content/uploads/2024/08/AxHatchetmen-022225-1080x1669v1.jpg	3313	2025-02-22 20:00:00	252	Ax and the Hatchetmen, Easy Honey
https://first-avenue.com/event/2025-03-orions-belte/	https://first-avenue.com/wp-content/uploads/2024/09/OrionsBelte-031225-1080x1439v1.jpg	3349	2025-03-12 19:30:00	252	Orions Belte, j ember
https://first-avenue.com/event/2025-02-free-fallin-our-house-taming-the-tiger/	https://first-avenue.com/wp-content/uploads/2024/10/FreeFallinTribute-022225-1080x1669-1.jpg	3314	2025-02-22 20:00:00	300	Free Fallin (The Tom Petty Concert Experience), Our House (A Tribute to Crosby, Stills, Nash, & Young), Taming the Tiger (Joni Mitchell Tribute)
https://first-avenue.com/event/2025-02-molchat-doma/	https://first-avenue.com/wp-content/uploads/2024/08/MolchatDoma-022225-1080.jpg	3315	2025-02-22 20:30:00	270	Molchat Doma, Sextile
https://first-avenue.com/event/2025-02-kxllswxtch-and-sxmpra/	https://first-avenue.com/wp-content/uploads/2024/10/Kxllswxtch-Sxmpra-022325-1080x1669-1.jpg	3316	2025-02-23 19:00:00	254	Kxllswxtch, SXMPRA
https://first-avenue.com/event/2025-02-pink-sweats/	https://first-avenue.com/wp-content/uploads/2024/11/PinkSweats-022325-1080.jpg	3317	2025-02-23 20:00:00	300	Pink Sweat$, Aqyila
https://first-avenue.com/event/2025-02-kelsy-karter-the-heroines/	https://first-avenue.com/wp-content/uploads/2024/11/KelsyKarter-022325-1080.jpg	3318	2025-02-23 20:00:00	252	Kelsy Karter & The Heroines
https://first-avenue.com/event/2025-02-post-sex-nachos/	https://first-avenue.com/wp-content/uploads/2024/11/PostSexNachos-022525-1080.jpg	3319	2025-02-25 20:00:00	252	Post Sex Nachos
https://first-avenue.com/event/2025-02-the-high-kings/	https://first-avenue.com/wp-content/uploads/2024/09/TheHighKings-022625-1080.jpg	3320	2025-02-26 19:30:00	300	The High Kings
https://first-avenue.com/event/2025-02-blockhead/	https://first-avenue.com/wp-content/uploads/2024/12/Blockhead-022725-1080.jpg	3321	2025-02-27 20:30:00	252	Blockhead
https://first-avenue.com/event/2025-02-missio/	https://first-avenue.com/wp-content/uploads/2024/11/MISSIO-022825-1080.jpg	3322	2025-02-28 20:00:00	254	MISSIO, Layto
https://first-avenue.com/event/2025-02-fink/	https://first-avenue.com/wp-content/uploads/2024/09/Fink-022825-1080.jpg	3323	2025-02-28 20:00:00	252	Fink
https://first-avenue.com/event/2025-02-pert-near-sandstone/	https://first-avenue.com/wp-content/uploads/2024/11/PertNearSandstone-Winter2025-1080x1669-1.jpg	3324	2025-02-28 20:00:00	291	Pert Near Sandstone, Dig Deep, Katey Bellville
https://first-avenue.com/event/2025-03-grace-enger/	https://first-avenue.com/wp-content/uploads/2024/12/GraceEnger-030125-1080.jpg	3325	2025-03-01 19:30:00	252	Grace Enger, jake minch
https://first-avenue.com/event/2025-03-cochise/	https://first-avenue.com/wp-content/uploads/2024/11/Cochise-030125-1080.jpg	3326	2025-03-01 19:30:00	269	Cochise, TisaKorean
https://first-avenue.com/event/2025-03-pert-near-sandstone/	https://first-avenue.com/wp-content/uploads/2024/11/PertNearSandstone-Winter2025-1080x1669-1.jpg	3327	2025-03-01 20:00:00	291	Pert Near Sandstone, Bronwyn Keith-Hynes, Feeding Leroy
https://first-avenue.com/event/2025-03-jesse-welles/	https://first-avenue.com/wp-content/uploads/2024/10/JesseWelles-030125-1080.jpg	3328	2025-03-01 20:00:00	262	Jesse Welles
https://first-avenue.com/event/2025-03-michael-marcagi/	https://first-avenue.com/wp-content/uploads/2024/10/MichaelMarcagi-030125-1080v1.jpg	3329	2025-03-01 20:00:00	270	Michael Marcagi, Ashley Kutcher
https://first-avenue.com/event/2025-03-drew-and-ellie-holcomb/	https://first-avenue.com/wp-content/uploads/2024/10/DrewEllieHolcomb-030225-1080x1440v0.jpg	3330	2025-03-02 19:00:00	300	DREW AND ELLIE HOLCOMB
https://first-avenue.com/event/2025-03-thrown/	https://first-avenue.com/wp-content/uploads/2024/11/Thrown-030225-1080.jpg	3331	2025-03-02 20:00:00	269	thrown, Varials, No Cure, Heavensgate
https://first-avenue.com/event/2025-03-mackenzy-mackay/	https://first-avenue.com/wp-content/uploads/2024/11/MackenzyMackay-030425-1080.jpg	3332	2025-03-04 19:30:00	252	Mackenzy Mackay
https://first-avenue.com/event/2025-03-gunnar/	https://first-avenue.com/wp-content/uploads/2024/10/Gunnar-030525-1080.jpg	3333	2025-03-05 19:30:00	252	GUNNAR
https://first-avenue.com/event/2025-03-twain-esther-rose/	https://first-avenue.com/wp-content/uploads/2024/10/Twain-030525-1080.jpg	3334	2025-03-05 20:00:00	291	Twain, Esther Rose
https://first-avenue.com/event/2025-03-jack-kays/	https://first-avenue.com/wp-content/uploads/2024/10/JackKays-030625-1080.jpg	3335	2025-03-06 19:30:00	269	Jack Kays
https://first-avenue.com/event/2025-03-this-wild-life/	https://first-avenue.com/wp-content/uploads/2024/10/ThisWIldLife-030625-1080.jpg	3336	2025-03-06 19:30:00	254	This Wild Life, Belmont, Young Culture
https://first-avenue.com/event/2025-03-k-flay/	https://first-avenue.com/wp-content/uploads/2024/10/KFlay-030625-1080.jpg	3337	2025-03-06 20:00:00	270	K.Flay, Vienna Vienna
https://first-avenue.com/event/2025-03-twin-cities-ballet-presents-romeo-juliet-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TCB-RJ-Mar2025-1080v0.jpg	3338	2025-03-07 19:30:00	300	Twin Cities Ballet presentsRomeo & Juliet: The Rock Ballet, live music byMark Joseph's Dragon Attack
https://first-avenue.com/event/2025-03-hazlett/	https://first-avenue.com/wp-content/uploads/2024/11/Hazlett-030725-1080x1669-1.jpg	3339	2025-03-07 19:30:00	269	Hazlett
https://first-avenue.com/event/2025-03-morgan-wade/	https://first-avenue.com/wp-content/uploads/2024/10/MorganWade-030725-1080.jpg	3340	2025-03-07 20:00:00	270	Morgan Wade, SPECIAL GUEST
https://first-avenue.com/event/2025-03-glixen/	https://first-avenue.com/wp-content/uploads/2024/11/Glixen-030725-1080.jpg	3341	2025-03-07 20:30:00	252	Glixen, she's green, Linus
https://first-avenue.com/event/2025-03-dwllrs/	https://first-avenue.com/wp-content/uploads/2024/11/Dwllrs-030825-1080.jpg	3342	2025-03-08 19:30:00	252	DWLLRS
https://first-avenue.com/event/2025-03-twin-cities-ballet-presents-romeo-juliet-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TCB-RJ-Mar2025-1080v0.jpg	3343	2025-03-08 19:30:00	300	Twin Cities Ballet presentsRomeo & Juliet: The Rock Ballet, live music byMark Joseph's Dragon Attack
https://first-avenue.com/event/2025-03-josh-meloy/	https://first-avenue.com/wp-content/uploads/2024/12/JoshMeloy-030825-1080x1669-1.jpg	3344	2025-03-08 20:30:00	270	Josh Meloy, Kenny Feidler
https://first-avenue.com/event/2025-03-brant-bjork-trio/	https://first-avenue.com/wp-content/uploads/2024/12/BrantBjork-030825-1080.jpg	3345	2025-03-08 21:00:00	291	The Brant Bjork Trio
https://first-avenue.com/event/2025-03-twin-cities-ballet-presents-romeo-juliet-sun/	https://first-avenue.com/wp-content/uploads/2024/10/TCB-RJ-Mar2025-1080v0.jpg	3346	2025-03-09 14:00:00	300	Twin Cities Ballet presentsRomeo & Juliet: The Rock Ballet, live music byMark Joseph's Dragon Attack
https://first-avenue.com/event/2025-03-sunny-sweeney/	https://first-avenue.com/wp-content/uploads/2024/06/SunnySweeney-031024-1080x1350-1.jpg	3347	2025-03-10 20:00:00	291	Sunny Sweeney, Cam Pierce
https://first-avenue.com/event/2025-03-lolo/	https://first-avenue.com/wp-content/uploads/2024/10/LOLO-031125-1080x1669-1.jpg	3348	2025-03-11 19:30:00	252	LØLØ
https://first-avenue.com/event/2024-03-michael-shannon-jason-narducy/	https://first-avenue.com/wp-content/uploads/2024/09/MichaelShannon-JasonNarducy-031225-1080x1669-1.jpg	3350	2025-03-12 19:30:00	270	Michael Shannon, Jason Narducy, Dave Hill
https://first-avenue.com/event/2025-03-soccer-mommy/	https://first-avenue.com/wp-content/uploads/2024/09/SoccerMommy-031325-1080x1669-1.jpg	3351	2025-03-13 19:30:00	270	Soccer Mommy, Hana Vu
https://first-avenue.com/event/2025-03-jessica-baio/	https://first-avenue.com/wp-content/uploads/2024/11/JessicaBaio-031425-1080.jpg	3352	2025-03-14 19:00:00	254	Jessica Baio
https://first-avenue.com/event/2025-03-macseal/	https://first-avenue.com/wp-content/uploads/2024/12/Macseal-031425-1080.jpg	3353	2025-03-14 19:30:00	252	MACSEAL, Carly Cosgrove, buffchick
https://first-avenue.com/event/2025-03-emei/	https://first-avenue.com/wp-content/uploads/2024/09/Emei-031425-1080.jpg	3354	2025-03-14 19:30:00	269	Emei
https://first-avenue.com/event/2025-03-jojo/	https://first-avenue.com/wp-content/uploads/2024/11/Jojo-031425-1080.jpg	3355	2025-03-14 20:00:00	270	JoJo, Emmy Meli
https://first-avenue.com/event/2025-03-adrian-younge/	https://first-avenue.com/wp-content/uploads/2024/11/AdrianYounge-031425-1080x1399-1.jpg	3356	2025-03-14 21:00:00	291	Adrian Younge
https://first-avenue.com/event/2025-03-maude-latour/	https://first-avenue.com/wp-content/uploads/2024/11/MaudeLatour-031525-1080.jpg	3357	2025-03-15 19:00:00	254	Maude Latour, MARIS
https://first-avenue.com/event/2025-03-skegss/	https://first-avenue.com/wp-content/uploads/2024/10/Skegss-031524-1080x1669-1.jpg	3358	2025-03-15 20:00:00	291	Skegss
https://first-avenue.com/event/2025-03-marc-broussard/	https://first-avenue.com/wp-content/uploads/2024/09/MarcBroussard-031525-1080x1669-1.jpg	3359	2025-03-15 20:00:00	300	Marc Broussard, Kendra Morris
https://first-avenue.com/event/2025-03-andy-frasco-and-the-un/	https://first-avenue.com/wp-content/uploads/2024/11/AndyFrasco-031525-1080.jpg	3360	2025-03-15 20:30:00	269	Andy Frasco & The U.N., Kris Lager
https://first-avenue.com/event/2025-03-ray-bull/	https://first-avenue.com/wp-content/uploads/2024/10/RayBull-031625-1080.jpg	3361	2025-03-16 19:30:00	252	Ray Bull
https://first-avenue.com/event/2025-03-alcest/	https://first-avenue.com/wp-content/uploads/2024/09/Alcest-031725-1080.jpg	3362	2025-03-17 19:30:00	269	Alcest, Kælan Mikla
https://first-avenue.com/event/2025-03-category-7/	https://first-avenue.com/wp-content/uploads/2024/10/Category7-031825-1080.jpg	3363	2025-03-18 19:45:00	269	Category 7, Exhorder, Engineered Society Project, Hand Of The Tribe
https://first-avenue.com/event/2025-03-paula-poundstone/	https://first-avenue.com/wp-content/uploads/2024/07/PaulaPoundstone-032125-1080.jpg	3364	2025-03-21 20:00:00	300	Paula Poundstone
https://first-avenue.com/event/2025-03-flipturn/	https://first-avenue.com/wp-content/uploads/2024/10/flipturn-032225-1080.jpg	3365	2025-03-22 19:30:00	279	flipturn
https://first-avenue.com/event/2025-03-russian-circles/	https://first-avenue.com/wp-content/uploads/2024/11/RussianCircles-032225-1080x1669-1.jpg	3366	2025-03-22 20:30:00	269	Russian Circles, Pelican
https://first-avenue.com/event/2025-03-tobe-nwigwe/	https://first-avenue.com/wp-content/uploads/2024/10/TobeNwigwe-032325-1080.jpg	3367	2025-03-23 19:30:00	270	Tobe Nwigwe
https://first-avenue.com/event/2025-03-lilly-hiatt/	https://first-avenue.com/wp-content/uploads/2024/11/LillyHiatt-032325-1080v0.jpg	3368	2025-03-23 20:00:00	291	Lilly Hiatt
https://first-avenue.com/event/2025-03-tigran-hamasyan/	https://first-avenue.com/wp-content/uploads/2024/11/TigranHamasyan-032325-1080.jpg	3369	2025-03-23 20:00:00	269	Tigran Hamasyan
https://first-avenue.com/event/2024-03-maya-hawke/	https://first-avenue.com/wp-content/uploads/2024/09/MayaHawke-032425-1080.jpg	3370	2025-03-24 19:00:00	279	Maya Hawke, Katy Kirby
https://first-avenue.com/event/2025-03-hovvdy/	https://first-avenue.com/wp-content/uploads/2024/10/Hovvdy-032425-1080.jpg	3371	2025-03-24 20:00:00	291	Hovvdy, Video Age
https://first-avenue.com/event/2024-03-donavon-frankenreiter/	https://first-avenue.com/wp-content/uploads/2024/11/DonavonFrankenreiter-032525-1080.jpg	3372	2025-03-25 20:00:00	291	Donavon Frankenreiter
https://first-avenue.com/event/2024-03-marc-scibilia/	https://first-avenue.com/wp-content/uploads/2024/09/MarcScibilia-032725-1080x1570-1.jpg	3373	2025-03-27 19:30:00	269	Marc Scibilia
https://first-avenue.com/event/2025-03-high-fade/	https://first-avenue.com/wp-content/uploads/2024/12/HighFade-032725-1080v0.jpg	3374	2025-03-27 20:00:00	252	High Fade, Purple Funk Metropolis
https://first-avenue.com/event/2025-03-waylon-wyatt/	https://first-avenue.com/wp-content/uploads/2024/11/WaylonWyatt-032825-1080.jpg	3375	2025-03-28 19:30:00	252	Waylon Wyatt
https://first-avenue.com/event/2025-03-vansire/	https://first-avenue.com/wp-content/uploads/2024/09/Vansire-032825-1080x1669-1.jpg	3376	2025-03-28 20:30:00	269	Vansire, JORDANN
https://first-avenue.com/event/2025-03-the-rocket-summer/	https://first-avenue.com/wp-content/uploads/2024/11/TheRocketSummer-032925-1080.jpg	3377	2025-03-29 20:00:00	291	The Rocket Summer, Mae
https://first-avenue.com/event/2025-03-wax-tailor/	https://first-avenue.com/wp-content/uploads/2024/09/WaxTailor-032925-1080v1.jpg	3378	2025-03-29 20:00:00	269	Wax Tailor, Napoleon Da Legend
https://first-avenue.com/event/2025-03-zz-ward/	https://first-avenue.com/wp-content/uploads/2024/10/ZZWard-032925-1080v1.jpg	3379	2025-03-29 20:00:00	300	ZZ Ward, Liam St. John
https://first-avenue.com/event/2024-03-snow-patrol/	https://first-avenue.com/wp-content/uploads/2024/09/SnowPatrol-033125-1080.jpg	3380	2025-03-31 19:30:00	279	Snow Patrol
https://first-avenue.com/event/2025-03-naked-giants/	https://first-avenue.com/wp-content/uploads/2024/11/NakedGiants-033125-1080.jpg	3381	2025-03-31 20:00:00	252	Naked Giants, Girl and Girl
https://first-avenue.com/event/2024-04-arts-fishing-club/	https://first-avenue.com/wp-content/uploads/2024/11/ArtsFishingClub-040225-1080.jpg	3382	2025-04-02 20:00:00	252	Arts Fishing Club
https://first-avenue.com/event/2025-04-sir-woman/	https://first-avenue.com/wp-content/uploads/2024/11/SirWoman-040225-1080.jpg	3383	2025-04-02 20:00:00	291	Sir Woman
https://first-avenue.com/event/2025-04-the-birthday-massacre/	https://first-avenue.com/wp-content/uploads/2024/11/TheBirthdayMassacre-040225-1080.jpg	3384	2025-04-02 20:00:00	269	The Birthday Massacre, Essenger, Magic Wands
https://first-avenue.com/event/2025-04-caravan-palace/	https://first-avenue.com/wp-content/uploads/2024/10/CaravanPalace-040325-1080x1669-1.jpg	3385	2025-04-03 20:00:00	270	Caravan Palace, ZAYKA
https://first-avenue.com/event/2025-04-la-lom/	https://first-avenue.com/wp-content/uploads/2024/12/LaLom-040425-1080.jpg	3386	2025-04-04 20:00:00	269	LA LOM
https://first-avenue.com/event/2025-04-bright-eyes/	https://first-avenue.com/wp-content/uploads/2024/08/BrightEyes-040425-1080v1.jpg	3387	2025-04-04 20:00:00	279	Bright Eyes, Cursive
https://first-avenue.com/event/2025-04-tamino/	https://first-avenue.com/wp-content/uploads/2024/10/Tamino-040425-1080x1440-1.jpg	3388	2025-04-04 20:00:00	300	Tamino, plus +.+
https://first-avenue.com/event/2025-04-the-hard-quartet/	https://first-avenue.com/wp-content/uploads/2024/10/TheHardQuartet-040525-1080.jpg	3389	2025-04-05 20:00:00	270	The Hard Quartet, Sharp Pins
https://first-avenue.com/event/2025-04-anxious/	https://first-avenue.com/wp-content/uploads/2024/12/Anxious-040525-1080.jpg	3390	2025-04-05 20:00:00	252	Anxious, Ultra Q, Stateside
https://first-avenue.com/event/event-2025-04-jack-white-mon/	https://first-avenue.com/wp-content/uploads/2024/11/JackWhite-Apr2025-1080.jpg	3391	2025-04-07 19:30:00	279	JACK WHITE
https://first-avenue.com/event/2025-04-ani-difranco/	https://first-avenue.com/wp-content/uploads/2024/09/AniDifranco-040825-1080.jpg	3392	2025-04-08 19:30:00	270	Ani DiFranco, Special Guests TBA
https://first-avenue.com/event/event-2025-04-jack-white-tue/	https://first-avenue.com/wp-content/uploads/2024/11/JackWhite-Apr2025-1080.jpg	3393	2025-04-08 19:30:00	279	JACK WHITE
https://first-avenue.com/event/2025-04-jazz-is-dead-feat-ebo-taylor-pat-thomas/	https://first-avenue.com/wp-content/uploads/2024/06/EboTaylorPatThomas-040925-1080.jpg	3394	2025-04-09 20:00:00	269	Ebo Taylor, Pat Thomas
https://first-avenue.com/event/2025-04-alan-sparhawk-mount-eerie/	https://first-avenue.com/wp-content/uploads/2024/11/AlanSparhawkMountEerie-041025-1080.jpg	3395	2025-04-10 19:00:00	270	Alan Sparhawk, Mount Eerie
https://first-avenue.com/event/2025-04-the-newest-olympian/	https://first-avenue.com/wp-content/uploads/2024/11/TheNewestOlympian-041025-1080.jpg	3396	2025-04-10 20:00:00	291	The Newest Olympian
https://first-avenue.com/event/2025-04-the-weather-station/	https://first-avenue.com/wp-content/uploads/2024/11/TheWeatherStation-041125-1080.jpg	3397	2025-04-11 20:30:00	291	The Weather Station
https://first-avenue.com/event/2025-04-canaan-cox/	https://first-avenue.com/wp-content/uploads/2024/10/CanaanCox-041125-1080x1407-1.jpg	3398	2025-04-11 20:30:00	252	Canaan Cox
https://first-avenue.com/event/2025-04-the-linda-lindas/	https://first-avenue.com/wp-content/uploads/2024/10/TheLindaLindas-041225-1080.jpg	3399	2025-04-12 19:30:00	269	The Linda Lindas, Pinkshift
https://first-avenue.com/event/2025-04-ninja-sex-party/	https://first-avenue.com/wp-content/uploads/2024/10/NinjaSexParty-041225-1080v0.jpg	3400	2025-04-12 20:00:00	270	Ninja Sex Party, TWRP
https://first-avenue.com/event/2025-04-visions-of-atlantis/	https://first-avenue.com/wp-content/uploads/2024/10/VisionsofAtlanis-041225-1080x1669-1.jpg	3401	2025-04-12 20:00:00	291	Visions of Atlantis
https://first-avenue.com/event/2025-04-shordie-shordie/	https://first-avenue.com/wp-content/uploads/2024/12/ShordieShordie-041325-1080x1669-1.jpg	3402	2025-04-13 20:00:00	269	Shordie Shordie
https://first-avenue.com/event/2025-04-wheatus/	https://first-avenue.com/wp-content/uploads/2024/11/Wheatus-041325-1080.jpg	3403	2025-04-13 20:00:00	252	Wheatus
https://first-avenue.com/event/2024-04-the-lagoons/	https://first-avenue.com/wp-content/uploads/2024/11/TheLagoons-041725-1080.jpg	3404	2025-04-17 20:00:00	252	The Lagoons
https://first-avenue.com/event/2025-04-elderbrook/	https://first-avenue.com/wp-content/uploads/2024/11/Elderbrook-041725-1080.jpg	3405	2025-04-17 20:00:00	270	Elderbrook, Jerro
https://first-avenue.com/event/2025-04-dawes/	https://first-avenue.com/wp-content/uploads/2024/09/Dawes-041825-1080.jpg	3406	2025-04-18 19:00:00	270	Dawes, Winnetka Bowling League
https://first-avenue.com/event/2025-04-james-bay/	https://first-avenue.com/wp-content/uploads/2024/10/JamesBay-042125-1080.jpg	3407	2025-04-21 19:00:00	270	James Bay
https://first-avenue.com/event/2025-04-boywithuke/	https://first-avenue.com/wp-content/uploads/2024/11/Boywithuke-042225-1080.jpg	3408	2025-04-22 19:00:00	279	BoyWithUke, Ethan Bortnick
https://first-avenue.com/event/2025-04-dean-lewis/	https://first-avenue.com/wp-content/uploads/2024/06/DeanLewis-042324-1080.jpg	3409	2025-04-23 19:30:00	279	Dean Lewis
https://first-avenue.com/event/2025-04-varietopia-with-paul-f-tompkins/	https://first-avenue.com/wp-content/uploads/2024/11/Varietourpia-042425-1080.jpg	3410	2025-04-24 20:00:00	300	Varietopia, Paul F. Tompkins
https://first-avenue.com/event/2024-04-ty-segall-solo/	https://first-avenue.com/wp-content/uploads/2024/07/TySegall-042525-1080v1.jpg	3411	2025-04-25 20:00:00	280	Ty Segall, Mikal Cronin (Solo)
https://first-avenue.com/event/2025-04-don-quixote-sat/	https://first-avenue.com/wp-content/uploads/2024/08/DonQuixote-Ballet-Apr2025-1080.jpg	3412	2025-04-26 19:30:00	300	Metropolitan Ballet presentsDon Quixote
https://first-avenue.com/event/2025-04-the-bright-light-social-hour/	https://first-avenue.com/wp-content/uploads/2024/11/TheBrightLightSocialHour-042625-1080.jpg	3413	2025-04-26 20:00:00	252	The Bright Light Social Hour
https://first-avenue.com/event/2025-04-maribou-state/	https://first-avenue.com/wp-content/uploads/2024/10/MaribouState-042625-1080.jpg	3414	2025-04-26 20:30:00	270	Maribou State
https://first-avenue.com/event/2025-04-keller-williams/	https://first-avenue.com/wp-content/uploads/2024/12/KellerWilliams-042625-1080.jpg	3415	2025-04-26 20:30:00	254	Keller Williams
https://first-avenue.com/event/2025-04-don-quixote-sun/	https://first-avenue.com/wp-content/uploads/2024/08/DonQuixote-Ballet-Apr2025-1080.jpg	3416	2025-04-27 14:00:00	300	Metropolitan Ballet presentsDon Quixote
https://first-avenue.com/event/2025-04-penny-and-sparrow/	https://first-avenue.com/wp-content/uploads/2024/10/PennySparrow-042725-1080v1.jpg	3417	2025-04-27 20:00:00	270	Penny & Sparrow, Field Guide
https://first-avenue.com/event/2025-04-awolnation/	https://first-avenue.com/wp-content/uploads/2024/09/Awolnation-042825-1080x1643-1.jpg	3418	2025-04-28 20:00:00	270	AWOLNATION, Bryce Fox
https://first-avenue.com/event/2025-04-jesse-cook/	https://first-avenue.com/wp-content/uploads/2024/06/JesseCook-042925-1080.jpg	3419	2025-04-29 20:15:00	300	Jesse Cook
https://first-avenue.com/event/2025-04-laura-jane-grace-the-mississippi-medicals/	https://first-avenue.com/wp-content/uploads/2024/11/LauraJaneGrace-043025-1080x1669-1.jpg	3420	2025-04-30 20:00:00	254	Laura Jane Grace, Alex Lahey, Noun
https://first-avenue.com/event/2025-05-the-wrecks/	https://first-avenue.com/wp-content/uploads/2024/09/TheWrecks-050125-1080x1372-1.jpg	3421	2025-05-01 19:00:00	270	The Wrecks
https://first-avenue.com/event/2025-05-papooz/	https://first-avenue.com/wp-content/uploads/2024/10/Papooz-050225-1080.jpg	3422	2025-05-02 20:00:00	291	Papooz
https://first-avenue.com/event/2025-05-clap-your-hands-say-yeah/	https://first-avenue.com/wp-content/uploads/2024/11/ClapYourHandsSayYeah-050225-1080.jpg	3423	2025-05-02 20:30:00	254	Clap Your Hands Say Yeah
https://first-avenue.com/event/2025-05-fox-stevenson/	https://first-avenue.com/wp-content/uploads/2024/11/FoxStevenson-050325-1080.jpg	3424	2025-05-03 20:00:00	291	Fox Stevenson, Yue
https://first-avenue.com/event/2025-05-ichiko-aoba/	https://first-avenue.com/wp-content/uploads/2024/11/IchikoAoba-050325-1080.jpg	3425	2025-05-03 20:00:00	300	Ichiko Aoba
https://first-avenue.com/event/2025-05-reggie-watts-live/	https://first-avenue.com/wp-content/uploads/2024/10/ReggieWatts-050325-1080x1669-1.jpg	3426	2025-05-03 20:30:00	269	Reggie Watts
https://first-avenue.com/event/2025-05-citizen-soldier/	https://first-avenue.com/wp-content/uploads/2024/11/CitizenSoldier-050525-1080.jpg	3427	2025-05-05 19:00:00	270	Citizen Soldier, 10 Years, Thousand Below, Nerv
https://first-avenue.com/event/2025-05-the-cavemen/	https://first-avenue.com/wp-content/uploads/2024/10/TheCavemen-050625-1080.jpg	3428	2025-05-06 20:00:00	252	The Cavemen.
https://first-avenue.com/event/2025-05-amyl-and-the-sniffers/	https://first-avenue.com/wp-content/uploads/2024/10/AmylAndTheSniffers-050725-1080.jpg	3429	2025-05-07 19:00:00	279	Amyl and The Sniffers, Sheer Mag
https://first-avenue.com/event/2025-05-allison-russell/	https://first-avenue.com/wp-content/uploads/2024/05/AllisonRussell-050925-1080.jpg	3430	2025-05-09 19:30:00	270	Allison Russell, Kara Jackson
https://first-avenue.com/event/2025-05-the-magnetic-fields-fri/	https://first-avenue.com/wp-content/uploads/2024/10/TheMagneticFields-May2025-1080x1209v0.jpg	3431	2025-05-09 20:00:00	300	The Magnetic Fields
https://first-avenue.com/event/2025-05-alison-moyet/	https://first-avenue.com/wp-content/uploads/2024/10/AlisonMoyet-050925-1080x1538-1.jpg	3432	2025-05-09 20:30:00	269	Alison Moyet
https://first-avenue.com/event/2025-05-sharon-van-etten/	https://first-avenue.com/wp-content/uploads/2024/12/SharonVanEtten-051025-1080.jpg	3433	2025-05-10 19:30:00	279	Sharon Van Etten, Love Spells
https://first-avenue.com/event/2025-05-the-magnetic-fields-sat/	https://first-avenue.com/wp-content/uploads/2024/10/TheMagneticFields-May2025-1080x1209v0.jpg	3434	2025-05-10 20:00:00	300	The Magnetic Fields
https://first-avenue.com/event/2025-05-gang-of-four/	https://first-avenue.com/wp-content/uploads/2024/10/GangofFour-051025-1080x1669-1.jpg	3435	2025-05-10 20:00:00	269	Gang of Four
https://first-avenue.com/event/2025-05-tommyinnit/	https://first-avenue.com/wp-content/uploads/2024/11/TommyInnit_051125-1080.jpg	3436	2025-05-11 20:00:00	300	TommyInnit
https://first-avenue.com/event/2025-05-boa/	https://first-avenue.com/wp-content/uploads/2024/10/Boa-051325-1080x1509v0.jpg	3437	2025-05-13 20:00:00	270	bôa
https://first-avenue.com/event/2025-05-saint-motel/	https://first-avenue.com/wp-content/uploads/2024/09/SaintMotel-051325-1080.jpg	3438	2025-05-13 20:00:00	279	Saint Motel, Brigitte Calls Me Baby
https://first-avenue.com/event/2025-05-spellling/	https://first-avenue.com/wp-content/uploads/2024/10/Spellling-051425-1080.jpg	3439	2025-05-14 20:00:00	269	SPELLLING
https://first-avenue.com/event/2025-05-cheekface/	https://first-avenue.com/wp-content/uploads/2024/12/Cheekface-051525-1080.jpg	3440	2025-05-15 20:00:00	269	Cheekface
https://first-avenue.com/event/2025-05-matthew-logan-vasquez/	https://first-avenue.com/wp-content/uploads/2024/10/MatthewLoganVasquez-051525-1080.jpg	3441	2025-05-15 20:30:00	252	Matthew Logan Vasquez, Jacob Alan Jaeger
https://first-avenue.com/event/2025-05-larkin-poe/	https://first-avenue.com/wp-content/uploads/2024/10/LarkinPoe-051625-1080v0.jpg	3442	2025-05-16 20:00:00	270	Larkin Poe, Amythyst Kiah
https://first-avenue.com/event/2025-05-the-devil-makes-three/	https://first-avenue.com/wp-content/uploads/2024/10/DevilMakesThree-051725-1080.jpg	3443	2025-05-17 20:30:00	270	The Devil Makes Three, Bridge City Sinners
https://first-avenue.com/event/2025-05-napalm-death-and-melvins/	https://first-avenue.com/wp-content/uploads/2024/11/NapalmDeath-Melvins-052225-1080.jpg	3444	2025-05-22 19:00:00	270	Napalm Death, Melvins, Hard-Ons (with Jerry A), Dark Sky Burial
https://first-avenue.com/event/2025-05-mike/	https://first-avenue.com/wp-content/uploads/2024/10/MIKE-052225-1080.jpg	3445	2025-05-22 20:00:00	254	MIKE
https://first-avenue.com/event/2025-05-friko/	https://first-avenue.com/wp-content/uploads/2024/10/Friko-052225-1080.jpg	3446	2025-05-22 20:30:00	269	Friko, youbet
https://first-avenue.com/event/2025-05-the-kiffness/	https://first-avenue.com/wp-content/uploads/2024/11/TheKiffness-052425-1080.jpg	3447	2025-05-24 19:30:00	269	The Kiffness
https://first-avenue.com/event/2025-05-sesame-street-live/	https://first-avenue.com/wp-content/uploads/2024/10/SesameStreetLive-052925-1080.jpg	3448	2025-05-29 18:00:00	300	Sesame Street Live — Say Hello
https://first-avenue.com/event/2025-05-hippo-campus/	https://first-avenue.com/wp-content/uploads/2024/09/HippoCampus-053125-1080.jpg	3449	2025-05-31 19:00:00	288	Hippo Campus, Hotline TNT
https://first-avenue.com/event/2025-05-the-wedding-present/	https://first-avenue.com/wp-content/uploads/2024/11/TheWeddingPresent-053125-1080.jpg	3450	2025-05-31 20:00:00	291	The Wedding Present, The Tubs
https://first-avenue.com/event/2025-05-jackie-venson/	https://first-avenue.com/wp-content/uploads/2024/12/JackieVenson-053125-1080.jpg	3451	2025-05-31 20:30:00	252	Jackie Venson
https://first-avenue.com/event/2025-06-sessanta-v2-0/	https://first-avenue.com/wp-content/uploads/2024/09/Sessanta-060125-1080.jpg	3452	2025-06-01 19:30:00	299	SESSANTA, Primus, Puscifer, A Perfect Circle
https://first-avenue.com/event/2025-06-jeremy-piven-live/	https://first-avenue.com/wp-content/uploads/2024/11/JeremyPiven-060725-1080v1.jpg	3453	2025-06-07 19:30:00	300	Jeremy Piven
https://first-avenue.com/event/2025-06-ashe/	https://first-avenue.com/wp-content/uploads/2024/10/Ashe-061125-1080x1578-1.jpg	3454	2025-06-11 19:30:00	270	Ashe
https://first-avenue.com/event/2025-06-samantha-crain/	https://first-avenue.com/wp-content/uploads/2024/11/SamanthaCrain-061525-1080.jpg	3455	2025-06-15 20:00:00	252	Samantha Crain
https://first-avenue.com/event/2025-06-old-gods-of-appalachia/	https://first-avenue.com/wp-content/uploads/2024/04/OldGodsAppalachia-061825-1080.jpg	3456	2025-06-18 20:00:00	300	Old Gods of Appalachia
https://first-avenue.com/event/2025-06-ben-rector/	https://first-avenue.com/wp-content/uploads/2024/11/BenRector-062025-1080.jpg	3457	2025-06-20 19:00:00	279	Ben Rector, The National Parks
https://first-avenue.com/event/2025-06-the-cat-empire/	https://first-avenue.com/wp-content/uploads/2024/12/TheCatEmpire-062425-1080.jpg	3458	2025-06-24 20:00:00	269	The Cat Empire
https://first-avenue.com/event/2025-06-omd/	https://first-avenue.com/wp-content/uploads/2024/04/OMD-062625-1080x1669-1.jpg	3459	2025-06-26 20:30:00	270	OMD, Walt Disco
https://first-avenue.com/event/2025-07-teddy-swims/	https://first-avenue.com/wp-content/uploads/2024/10/TeddySwims-070625-1080.jpg	3460	2025-07-06 20:00:00	255	Teddy Swims
https://first-avenue.com/event/2025-07-mekons/	https://first-avenue.com/wp-content/uploads/2024/11/mekons-070925-1080.jpg	3461	2025-07-09 20:00:00	269	mekons, Jake La Botz
https://first-avenue.com/event/2025-07-pixies/	https://first-avenue.com/wp-content/uploads/2024/10/Pixies-2025-1080x1297-1.jpg	3462	2025-07-31 20:00:00	279	Pixies, Kurt Vile and The Violators
https://first-avenue.com/event/2025-08-pixies/	https://first-avenue.com/wp-content/uploads/2024/10/Pixies-2025-1080x1297-1.jpg	3463	2025-08-01 20:00:00	279	Pixies, Kurt Vile and The Violators
https://www.greenroommn.com#/events/101626	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_45711aaeba0d29954e50a0b0a323500533a300739493e349917d96e5cbd6d274.png	3464	2024-12-05 19:00:00	272	SNAPPED Live Band Open Mic
https://www.greenroommn.com#/events/121822	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_ec763dd3da8bbfec4323b2663b32847e6c8831ca14d1587ffe4c0e5c9415171c.jpg	3465	2024-12-06 21:00:00	272	Late Nite Take Out
https://www.greenroommn.com#/events/121200	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_dec9262102a6619cf0cbc15a24e7a214bb824cb382f0566ba844a880cef6f1e6.jpg	3466	2024-12-07 20:00:00	272	MATI, Kwey, Gr3g, Mack OC
https://www.greenroommn.com#/events/124275	https://s3.amazonaws.com/files.venuepilot.com/attachments/3c50e3ec06bf28aeecc444d946a9b2861ee806f353ff7f588b56f60f019a42f4.png	3467	2024-12-08 22:00:00	272	Synastry Sundays - A late night dance party, Techno/house
https://www.greenroommn.com#/events/101627	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_45711aaeba0d29954e50a0b0a323500533a300739493e349917d96e5cbd6d274.png	3468	2024-12-12 19:00:00	272	Snapped Live Band Open Mic
https://www.greenroommn.com#/events/114701	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_96650aa65e163e69ded3b6e8db2c4faa916abb917d4bd69c47121a4e08681b27.jpg	3469	2024-12-13 19:00:00	272	YAM HAUS brotherkenzie, Night 1
https://www.greenroommn.com#/events/114702	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_1229c858ef538a20f91adff718a5e63a74d73c9be7d6d647f6aba64c231d2091.jpg	3470	2024-12-14 19:00:00	272	YAM HAUS Misty Boyce, Night 2
https://www.greenroommn.com#/events/124276	https://s3.amazonaws.com/files.venuepilot.com/attachments/3c50e3ec06bf28aeecc444d946a9b2861ee806f353ff7f588b56f60f019a42f4.png	3471	2024-12-15 22:00:00	272	Synastry Sundays - A late night dance party, Techno/house
https://www.greenroommn.com#/events/101628	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_8c81a320e105630b17a396bce986764d9adbdfb55ed14d1ac8493e3a70fc83b3.png	3472	2024-12-19 19:00:00	272	Adam Bohanan Birthday Show, Jordan Johnston
https://www.greenroommn.com#/events/104677	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_704cd1ad5489ba3cd6b87bd236923b83009d940e5089f837ce0fa90c9afcb5b6.jpg	3473	2024-12-20 21:00:00	272	Luttrell - 'Life At Full Speed' Album Tour
https://www.greenroommn.com#/events/102379	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_4f25bdcdae2d5449f7eeebf517846f33fd5133b7baf7fef45620ff40ba20798d.png	3474	2024-12-21 19:00:00	272	Tiny Moving Parts, Action/Adventure, Greywind
https://www.greenroommn.com#/events/124277	https://s3.amazonaws.com/files.venuepilot.com/attachments/3c50e3ec06bf28aeecc444d946a9b2861ee806f353ff7f588b56f60f019a42f4.png	3475	2024-12-22 22:00:00	272	Synastry Sundays - A late night dance party, techno/house
https://www.greenroommn.com#/events/101629	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_45711aaeba0d29954e50a0b0a323500533a300739493e349917d96e5cbd6d274.png	3476	2024-12-26 19:00:00	272	SNAPPED Live Band Open Mic
https://www.greenroommn.com#/events/119547	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_91fb140ee94fb95cfe78f2bc2945e3ac90af02bb17b4f5057c322f186786759a.png	3477	2024-12-27 19:00:00	272	Aiden Intro X Chutes
https://www.greenroommn.com#/events/124278	https://s3.amazonaws.com/files.venuepilot.com/attachments/3c50e3ec06bf28aeecc444d946a9b2861ee806f353ff7f588b56f60f019a42f4.png	3478	2024-12-29 22:00:00	272	Synastry Sundays - A late night dance party, techno/house
https://www.greenroommn.com#/events/114761	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_32ffcbf059ec4b26791edc42fa01afe7944326082d1cbcbc471972a92fa0599d.png	3479	2024-12-31 21:00:00	272	NEW YEARS EVE w/ DJ Hampster Dance + Live Band Karaoke, Live Band Karaoke from A little Too Short to be Stormtroopers
https://www.greenroommn.com#/events/122226	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a799ac06297b62850a13d388f6bd43984a29c3e536a9d18f25fa497a200802a9.png	3480	2025-01-31 19:00:00	272	2 Year Anniversary - NIGHT 1 - The Shackletons, Megasound, Dark Pony, Katacombs, The Shackletons, Megasound, Dark Pony, Katacombs
https://www.greenroommn.com#/events/120394	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_a799ac06297b62850a13d388f6bd43984a29c3e536a9d18f25fa497a200802a9.png	3481	2025-02-01 18:00:00	272	2 Year Anniversary NIGHT 2 - Marijuana Deathsquads, Why Not, Reiki, Ava Levy, Marijuana Deathsquads, Why Not, Reiki, Ava Levy
https://www.greenroommn.com#/events/122235	https://s3.amazonaws.com/files.venuepilot.com/attachments/cover_16f2b713e3fb2e5f65fd24949899a635363d03f2988d26fbc59c584e9cf263b6.jpg	3482	2025-05-02 18:00:00	272	ROLLING QUARTZ - Stand Up Tour in Minneapolis
https://link.dice.fm/Fd7b7ede75fa?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4227	2024-12-04 19:00:00	298	King Caesar, Primitive Broadcast Service, Helseher, Blacklighter
https://link.dice.fm/a2fa328b9fef?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4228	2024-12-06 19:00:00	298	Night 1:  Quicksand, Pilot to Gunner, Unstable Shapes
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3717	2024-12-04 19:00:00	251	Harold’s House Party on KFAI, Pistol Whippin Party Penguins
https://www.facebook.com/bossopoetrycompany?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3718	2024-12-04 21:30:00	251	Bosso Poetry Company
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3719	2024-12-05 21:30:00	251	NORTHEAST INVITATIONAL
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3720	2024-12-06 19:00:00	251	Movie Music Trivia
https://www.facebook.com/nightofjoympls?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3721	2024-12-06 22:00:00	251	Night Of Joy, Tender Comrade, Field Hospitals
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3722	2024-12-07 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3723	2024-12-07 22:00:00	251	SnoBall 2024 sing along after party, Holiday Sing Along w/Eric Radloff, Elour
https://www.facebook.com/profile.php?id=100090071273380&mibextid=7cd5pb	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3724	2024-12-08 19:00:00	251	Emmy Woods & The Red Pine Ramblers, Slapdash Bluegrass Band
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3725	2024-12-09 18:30:00	251	Saint Paul Mudsteppers
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3726	2024-12-09 20:00:00	251	Roe Family Singers
https://www.facebook.com/eldrifteofficial?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3727	2024-12-10 21:30:00	251	December Conspiracy Series featuring, El Drifte, Jared McCloud
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3728	2024-12-11 19:00:00	251	Harold’s House Party on KFAI, Jeff Ray the Stakes
https://www.facebook.com/bobfreymusic?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3729	2024-12-11 21:30:00	251	Bob Frey
https://www.facebook.com/share/19nRcRm4F4/?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3730	2024-12-12 21:30:00	251	Said Kelley, Rachel Kurtz, Katacombs
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3731	2024-12-13 19:00:00	251	Movie Music Trivia
https://www.instagram.com/threadselectric?igsh=Z25oNGpybWU0ZnRw	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3732	2024-12-13 22:00:00	251	Threads Electric, Son/Boy, Poolboy
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3733	2024-12-14 15:00:00	251	Voltage Controller
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3734	2024-12-14 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/thedelviles?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3735	2024-12-14 22:00:00	251	Del-Viles, Nathan Walker, Craig. Sensitive
https://www.instagram.com/switchyard.band.mpls?igsh=eTJ6OTk2eXVubHZt	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3736	2024-12-15 19:00:00	251	Switchyard
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3737	2024-12-15 22:30:00	251	eleven degenerates
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3738	2024-12-16 18:00:00	251	“Womenfolk Presents”
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3739	2024-12-16 20:00:00	251	Roe Family Singers
https://www.facebook.com/eldrifteofficial?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3740	2024-12-17 21:30:00	251	December Conspiracy Series featuring, El Drifte, The Beavers
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3741	2024-12-18 19:00:00	251	Harold’s House Party on KFAI, Dylan Salfer Band
https://www.facebook.com/pages/Lenz-and-Frenz/1515949742024571	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3742	2024-12-18 21:30:00	251	Lenz & Frenz, (Certain members of Pert Near Sandstone, Farmhouse Band, San Souci Quartet, Row of Ducks)
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3743	2024-12-19 21:30:00	251	Cross Pollination
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3744	2024-12-20 19:00:00	251	Movie Music Trivia
https://www.instagram.com/ditchpigeon?igsh=cjEwMG9lY2U5cjl3	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3745	2024-12-20 22:00:00	251	ditch pigeon, liluna, the hyperbolic age, frank & janea, illicit energy
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3746	2024-12-21 19:00:00	251	Drinkin’ Spelling Bee
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4177	2024-12-03 18:30:00	281	SONGBIRD SERIES, 
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3750	2024-12-23 20:00:00	251	Roe Family Singers
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3752	2024-12-27 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3754	2024-12-28 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/beckykapellmusic?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3756	2024-12-29 19:00:00	251	Becky Kapell The Fat 6
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3757	2024-12-30 20:00:00	251	Roe Family Singers
https://www.facebook.com/bossopoetrycompany?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3759	2025-01-01 21:30:00	251	Bosso Poetry Company
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3761	2025-01-02 21:30:00	251	NORTHEAST INVITATIONAL
https://www.facebook.com/jeffraymusic1?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3762	2025-01-03 22:00:00	251	Jeff Ray Trio
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3764	2025-01-04 22:00:00	251	The Cameras
https://www.facebook.com/woodzenmn?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3767	2025-01-06 20:00:00	251	Woodzen
https://www.facebook.com/share/184U49GZuE/?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3769	2025-01-08 21:30:00	251	Potential New Boyfriend
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3771	2025-01-09 21:30:00	251	Andrew Kneeland & Marti Moreno
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3773	2025-01-10 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3775	2025-01-11 19:00:00	251	Drinkin’ Spelling Bee
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3776	2025-01-11 15:00:00	251	Voltage Controller
https://www.facebook.com/ErikandUHQ?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3778	2025-01-13 20:00:00	251	Erik Brandt friends
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3780	2025-01-15 21:30:00	251	Lightbirds
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3782	2025-01-16 21:30:00	251	Cross Pollination
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3784	2025-01-17 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3789	2025-01-19 22:30:00	251	eleven degenerates
https://www.instagram.com/switchyard.band.mpls?igsh=eTJ6OTk2eXVubHZt	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3790	2025-01-19 19:00:00	251	witchyard
https://www.facebook.com/emilyhaavikmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3792	2025-01-20 18:00:00	251	“Womenfolk Presents”, Emily Haavik
https://www.facebook.com/triplefiddle?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3794	2025-01-22 21:30:00	251	Triple Fiddle
http://www.lenaelizabeth.com	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3796	2025-01-23 21:30:00	251	Lena Elizabeth
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3798	2025-01-24 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3800	2025-01-25 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/saidinstoneband?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3802	2025-01-27 20:00:00	251	Said in Stone
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3804	2025-01-28 21:30:00	251	January Conspiracy Series featuring, TBA
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3806	2025-01-29 19:00:00	251	Harold’s House Party on KFAI, TBA
https://www.facebook.com/share/1FR7mQb7DY/?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3807	2025-01-30 21:30:00	251	The Record Club
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3808	2025-01-31 22:00:00	251	TBA
https://www.facebook.com/profile.php?id=100063684781557&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3811	2025-02-02 19:00:00	251	Brass Messengers
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3813	2025-02-04 21:30:00	251	February Conspiracy Series featuring, Elour
https://www.facebook.com/profile.php?id=100094683949311&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3749	2024-12-23 18:00:00	251	HonkyTonk Ranch
https://www.facebook.com/mikemunson?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3751	2024-12-26 21:30:00	251	mike munson
https://www.facebook.com/bethanylarsonandthebeesknees?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3753	2024-12-27 22:00:00	251	Bethany Larson the Bee’s Knees, Andra Suchy, Boots & Needles
https://www.facebook.com/nightauditband?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3755	2024-12-28 22:00:00	251	Night Audit, North Innsbruck, wolfbabycup
https://www.facebook.com/eldrifteofficial?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3758	2024-12-31 21:30:00	251	December Conspiracy Series featuring, El Drifte, Leslie Rich the Rocket Soul Choir, The Infernos
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3760	2025-01-01 19:00:00	251	Harold’s House Party on KFAI, TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3763	2025-01-03 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3765	2025-01-04 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/profile.php?id=100063684781557&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3766	2025-01-05 19:00:00	251	Brass Messengers
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3768	2025-01-07 21:30:00	251	January Conspiracy Series featuring, TBA
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3770	2025-01-08 19:00:00	251	Harold’s House Party on KFAI, TBA
https://www.instagram.com/speedridersband?igsh=NXBwY2xiZ3Rmc3hh	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3772	2025-01-10 22:00:00	251	Speed Riders, Sparrowhawk, Sick Eagle
https://www.facebook.com/profile.php?id=100063653763990&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3774	2025-01-11 22:00:00	251	Rank Strangers, The Bury ‘Em Deep, Superfloor
https://www.facebook.com/profile.php?id=100090071273380&mibextid=7cd5pb	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3777	2025-01-12 19:00:00	251	Emmy Woods & The Red Pine Ramblers
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3779	2025-01-14 21:30:00	251	January Conspiracy Series featuring, TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3816	2025-02-06 21:30:00	251	NORTHEAST INVITATIONAL
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3817	2025-02-07 22:00:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3819	2025-02-08 22:00:00	251	TBA
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3822	2025-02-10 20:00:00	251	Roe Family Singers
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3825	2025-02-12 21:30:00	251	TBA
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3826	2025-02-12 19:00:00	251	Harold’s House Party on KFAI, TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3828	2025-02-14 22:00:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3831	2025-02-15 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3834	2025-02-17 20:00:00	251	Roe Family Singers
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3836	2025-02-19 21:30:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3838	2025-02-20 21:30:00	251	Cross Pollination
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3840	2025-02-21 19:00:00	251	Movie Music Trivia
https://www.facebook.com/profile.php?id=100094683949311&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3844	2025-02-24 18:00:00	251	HonkyTonk Ranch
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3845	2025-02-24 20:00:00	251	Roe Family Singers
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3848	2025-02-26 19:00:00	251	Harold’s House Party on KFAI, TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3849	2025-02-27 21:30:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3850	2025-02-28 22:00:00	251	TBA
https://www.instagram.com/redeyerubymusic?igsh=bzY0Nm55aXRyYWh5	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3785	2025-01-18 22:00:00	251	Red Eye Ruby
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3781	2025-01-15 19:00:00	251	Harold’s House Party on KFAI, TBA
https://www.instagram.com/poolboytheband?igsh=NDNranJhYW54cDQ4	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3783	2025-01-17 22:00:00	251	Poolboy, Beemer, Seven Pines
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3786	2025-01-18 19:00:00	251	Drinkin’ Spelling Bee
https://m.facebook.com/ruemates/	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3791	2025-01-20 20:00:00	251	Nikki & the Ruemates
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3793	2025-01-21 21:30:00	251	January Conspiracy Series featuring, TBA
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3795	2025-01-22 19:00:00	251	Harold’s House Party on KFAI, TBA
https://www.facebook.com/matthewthomaswoundedwing?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3797	2025-01-24 22:00:00	251	Matthew Thomas & Wounded Wing
https://www.instagram.com/thehavanasleeve?igsh=OXNhdjBkazk3cnZ2	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3799	2025-01-25 22:00:00	251	The Havana Sleeve
https://www.facebook.com/profile.php?id=61557848086888&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3801	2025-01-26 19:00:00	251	The Real Chuck NORAD
https://www.facebook.com/profile.php?id=100094683949311&mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3803	2025-01-27 18:00:00	251	HonkyTonk Ranch
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3809	2025-01-31 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3810	2025-02-01 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/roefamilysingers/?fref=ts	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3812	2025-02-03 20:00:00	251	Roe Family Singers
https://www.facebook.com/bossopoetrycompany?mibextid=LQQJ4d	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3814	2025-02-05 21:30:00	251	Bosso Poetry Company
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3815	2025-02-05 19:00:00	251	Harold’s House Party on KFAI, TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3818	2025-02-07 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3820	2025-02-08 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/profile.php?id=100090071273380&mibextid=7cd5pb	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3821	2025-02-09 19:00:00	251	Emmy Woods & The Red Pine Ramblers
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3823	2025-02-10 18:00:00	251	Träctorheäd
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3824	2025-02-11 21:30:00	251	February Conspiracy Series featuring, Elour
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3827	2025-02-13 21:30:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3829	2025-02-14 19:00:00	251	Movie Music Trivia
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3830	2025-02-15 22:00:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3832	2025-02-16 22:30:00	251	eleven degenerates
https://www.instagram.com/switchyard.band.mpls?igsh=eTJ6OTk2eXVubHZt	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3833	2025-02-16 19:00:00	251	witchyard
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3835	2025-02-17 18:00:00	251	“Womenfolk Presents”, TBA
https://www.facebook.com/profile.php?id=100063582730118	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3837	2025-02-19 19:00:00	251	Harold’s House Party on KFAI, TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3839	2025-02-21 22:00:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3841	2025-02-22 22:00:00	251	TBA
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3842	2025-02-22 19:00:00	251	Drinkin’ Spelling Bee
https://www.facebook.com/profile.php?id=61557848086888&mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3843	2025-02-23 19:00:00	251	The Real Chuck NORAD
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4178	2024-12-04 18:30:00	281	SASSAFRASS, Barnacle, stone ark, Berzica, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4179	2024-12-05 18:30:00	281	THE TOLERABLES, Delilah Daybreaks, My Kid Banana, 
https://www.facebook.com/elourmusic?mibextid=JRoKGi	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3846	2025-02-25 21:30:00	251	February Conspiracy Series featuring, Elour
https://www.facebook.com/pages/Lenz-and-Frenz/1515949742024571	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3847	2025-02-26 21:30:00	251	Lenz & Frenz, (Certain members of Pert Near Sandstone, Farmhouse Band, San Souci Quartet, Row of Ducks)
\N	https://www.mnvibe.com/sites/default/files/styles/max_650x650/public/2022-09/5013409958_17377ca2c1_c.jpg?itok=42M5mkxp	3851	2025-02-28 19:00:00	251	Movie Music Trivia
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4180	2024-12-06 19:00:00	281	Doll Chaser, Kyrie Nova & the Defiant, Shitty Kickflips, thumper, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4181	2024-12-07 19:00:00	281	THE CAMERAS, Brother Means Ally, The Penny Peaches, Anything You Want, Free
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4182	2024-12-08 18:30:00	281	DAISYCUTTER, Dead History, Toilet Rats, Linus, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4183	2024-12-09 18:30:00	281	SARAH JANE MUSIC SCHOOL SHOWCASE, free
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4184	2024-12-11 18:30:00	281	SARAH JANE MUSIC SCHOOL SHOWCASE, free
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4185	2024-12-12 18:30:00	281	cervesa muscular, Matt Caflisch’s B, Street Hassle, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4186	2024-12-13 19:00:00	281	DEN OF THIEVES, TBA, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4187	2024-12-14 18:30:00	281	AUTUMN, OBSERVANT, Darkling I Listen, Echo Signal, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4188	2024-12-17 18:30:00	281	BOYSINTHEROSEGARDEN, Annika, carter quinn, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4189	2024-12-18 18:30:00	281	Lost Evidence, Better Devils, Millennial Falcon, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4190	2024-12-19 18:30:00	281	ALEXANDER NATALIE, Nice., .Blue, Allergen, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4191	2024-12-20 19:00:00	281	ASPARAGUS, Lana Leone, SoL, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4192	2024-12-21 18:30:00	281	LITTLE LEBOWSKI URBAN ACHIEVERS, Arthur Conrad, Boots & Needles, Toilet Rats, Challenger Disaster Conspiracy, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4193	2024-12-23 18:30:00	281	Twin River, Barnacle, Sunsets Over Vlowers, DJ set - Issac, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4194	2024-12-26 18:30:00	281	FATHER PARANOIA, TBA, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/6f26c70b5c5b433a3cc5117d50e66bcf.jpg	4195	2024-12-27 19:00:00	281	BLACKOUTMOB, big Kia, dd the Spektrum, , TICKETS
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/8ec526f55a82bc303a846b414d64c775.jpg	4196	2024-12-28 19:00:00	281	FINICK, Delicate Friend Sylvia Dieken, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4197	2024-12-30 18:30:00	281	GRUDD WALLACE, Crimson Boys, Pew Pew, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4198	2024-01-01 18:30:00	281	TBA, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4199	2024-01-02 18:30:00	281	Lena Nine, TBA, 
https://www.pilllar.com/pages/events	https://pagestudio.s3.theshoppad.net/pillar-skatebaords/c265ef7d85125aa87c874b745d5ecf39.jpg	4200	2024-01-04 19:00:00	281	Jared McCloud, Nobody from Nowhere, Cassandra Cole, 
https://link.dice.fm/p4591e096a78?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4229	2024-12-07 11:00:00	298	Burlesque Brunch!
https://link.dice.fm/w93b43c379a2?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4230	2024-12-07 19:00:00	298	Night 2:  Quicksand, The Rope, Pilot to Gunner, Pill Cutter
https://link.dice.fm/vb0e4fa21107?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4231	2024-12-13 19:00:00	298	Pleezer, Piece of Cake, SMILE Like You Mean It!
https://link.dice.fm/s866f3c891ba?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4232	2024-12-14 19:30:00	298	MURF, The Cult of Nasty (MKE), Müllet
https://link.dice.fm/ea485112566a?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4233	2024-12-20 21:00:00	298	BIZARRE
https://link.dice.fm/Ta23e4a05ec7?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4234	2024-12-21 18:30:00	298	Boy Hero, Friends
https://link.dice.fm/Le9c10511bc1?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4235	2025-01-03 19:30:00	298	Tribute Night, Mind Out of Time, Friends
https://link.dice.fm/Hbcff20fba01?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4236	2025-01-11 18:00:00	298	Surrounded by Water Album Release Show
https://link.dice.fm/w2a2bb910b69?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4237	2025-01-15 18:30:00	298	Dead by 50, Blame the Witness, Waar Party
https://link.dice.fm/vf48cee46350?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4238	2025-01-17 21:00:00	298	Wax Appeal feat. E-Tones and The Excavators
https://link.dice.fm/F0ef469b1fea?pid=1d4479ef	https://static1.squarespace.com/static/62d0696dd7c05a09faf9360e/62e017421aa35c4414ece61c/6470f58e9ea2ba602a356c73/1697038330050/Screenshot+2023-10-11+at+10.31.10+AM.png	4239	2025-02-16 19:00:00	298	Rickshaw Billie's Burger Patrol, Lip Critic
\.


--
-- Data for Name: tcupbands; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.tcupbands (id, name, social_links, genre, bandemail, play_shows, group_size, created_at, images, profile_image, music_links) FROM stdin;
73	Gully Boys	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}			{}	2024-12-03 16:33:14.494304	{/assets/images/1733272887182-550288147-77B87E1B-CB34-4C73-96F7-C54BDB46D267_1_102_o.jpeg}	\N	\N
76	Bryn Battani	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}			{}	2024-12-05 08:33:56.334841	{"/assets/images/1733430726936-294948278-images (5).jpeg"}	\N	{"spotify": "https://open.spotify.com/album/3LR5fZOA4m2jlNO2Y4y283?si=KvBEt-7zQnifK2dWRuOY3A", "youtube": "", "bandcamp": "", "soundcloud": ""}
75	bathtub cig	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		maybe	{Solo,Duo,Trio,4-piece}	2024-12-05 08:33:18.339812	{/assets/images/1733430637325-801401178-a0510147453_2.jpg,/assets/images/1733432236991-253856342-674653-20210514-bathtub-cig-03-400.jpg}	\N	{"spotify": "https://open.spotify.com/album/7ESFgrL7KHKs9icAL6ogIS?si=K8Jg-PWAR1y27PYW62z8Ww", "youtube": "", "bandcamp": "", "soundcloud": ""}
80	Jerrika Mighelle	{"spotify": "", "website": "", "bandcamp": "", "instagram": "", "soundcloud": ""}	{}		no	{}	2024-12-05 16:47:52.377209	{}	\N	{"spotify": "", "youtube": "", "bandcamp": "", "soundcloud": ""}
74	Ghosting Merit	{"spotify": "https://open.spotify.com/artist/1wrFo6PJbIqrf8cwdhG5Rq?si=skyLwfBmRVShuOAIE0Brrg", "website": "", "bandcamp": "https://ghostingmerit.bandcamp.com/", "instagram": "", "soundcloud": ""}	{}			{}	2024-12-03 16:41:25.895555	{/assets/images/1733415367104-276299571-0036051396_10.jpg,/assets/images/1733415386842-684290142-buckytruck.jpeg}	\N	{"spotify": "https://open.spotify.com/album/0Lk6k671jsdFy5AYxP5yI1?si=vRPRySb0TqiEqwtCKMdPSg", "youtube": "", "bandcamp": "https://ghostingmerit.bandcamp.com/album/little-rituals", "soundcloud": ""}
71	Yellow Ostrich	{"spotify": "https://open.spotify.com/artist/3zIJJVhqINXeuLWMbZdlbY?si=4F4kHB2vSJya1qcsIvJ6dQ", "website": "", "youtube": "https://www.youtube.com/channel/UCrBfVlCltcSVtmUB7iXd9cg", "bandcamp": "https://yellowostrich.bandcamp.com/", "instagram": "", "soundcloud": ""}	{"Indie Rock",Guitars,Swoovy}			{}	2024-12-02 21:41:31.739159	{/assets/images/1733351941009-903957423-poolboyreleaseshow-11.jpeg}	\N	{"spotify": "https://open.spotify.com/album/6cxFUhJr7l9RslcU5gq99E?si=Xxg5Z4cSTEOa6ueSqU9Sug", "youtube": "", "bandcamp": "", "soundcloud": ""}
\.


--
-- Data for Name: venues; Type: TABLE DATA; Schema: public; Owner: aschaaf
--

COPY public.venues (id, venue, location, capacity, cover_image) FROM stdin;
273	Hook & Ladder	3010 Minnehaha Ave, Minneapolis, MN 55406	280	Hook_and_Ladder.jpg
278	Palmer's Bar	500 Cedar Ave, Minneapolis, MN 55454	200	Palmer's.jpg
299	Xcel Energy Center	199 W Kellogg Blvd, St Paul, MN 55102	20554	\N
300	The Fitzgerald Theater	10 E Exchange St, St Paul, MN 55101	1058	\N
301	State Theatre	805 Hennepin Ave, Minneapolis, MN 55402	2181	\N
257	Berlin	204 N 1st St, Minneapolis, MN 55401	85	Berlin.jpg
256	Aster Cafe	125 SE Main St, Minneapolis, MN 55414	100	Aster_Cafe.jpg
284	ROK Music Lounge	882 7th St W Suite 12, St Paul, MN 55102	75	ROK_Music_Lounge.jpg
280	Parkway Theater	4814 Chicago Ave, Minneapolis, MN 55417	365	Parkway_Theater.jpg
260	Can Can Wonderland	755 Prior Ave N Suite 004, St Paul, MN 55104	1000	Can_Can_Wonderland.jpg
258	Bryant Lake Bowl	810 W Lake St, Minneapolis, MN 55408	85	Bryant_Lake_Bowl.jpg
272	Green Room	2923 Girard Ave S, Minneapolis, MN 55408	400	Green_Room.jpg
295	Varsity Theater	1308 SE 4th St, Minneapolis, MN 55414	750	Varsity_Theater.jpg
287	Sociable Cider Works	1500 Fillmore St NE, Minneapolis, MN 55413	110	Sociable_Cider_Works.jpg
263	Cloudland	3533 E Lake St, Minneapolis, MN 55406	150	Cloudland.jpg
290	Temple St Paul	1190 W James Ave, St Paul, MN 55105	200	Temple_St_Paul.jpg
275	MirrorLab	3400 Cedar Ave, Minneapolis, MN 55407	80	MirrorLab.jpg
269	Fine Line	318 N 1st Ave, Minneapolis, MN 55401	650	Fine_Line.jpg
267	Eagles 34	2507 E 25th St, Minneapolis, MN 55406	200	Eagles_34.jpg
274	Icehouse	2528 Nicollet Ave, Minneapolis, MN 55404	350	Icehouse.jpg
293	Uptown Theater	2900 Hennepin Ave, Minneapolis, MN 55408	1688	Uptown_Theater.jpg
264	Clown Lounge	1601 University Ave W, St Paul, MN 55104	100	Clown_Lounge.jpg
292	Underground Music Cafe	408 N 3rd Ave, Minneapolis, MN 55401	540	Underground_Music_Cafe.jpg
259	Cabooze	913 Cedar Ave, Minneapolis, MN 55404	1000	Cabooze.jpg
294	Uptown VFW	2916 Lyndale Ave S, Minneapolis, MN 55408	444	Uptown_VFW.jpg
276	Memory Lanes	2520 26th Ave S, Minneapolis, MN 55406	200	Memory_Lanes.jpg
291	Turf Club	1601 University Ave W, St Paul, MN 55104	350	Turf_Club.jpg
296	White Rock Lounge	417 Broadway St, St Paul, MN 55101	100	White_Rock_Lounge.jpg
297	White Squirrel	974 7th St W, St Paul, MN 55102	56	White_Squirrel.jpg
255	Armory	500 South 6th St, Minneapolis, MN 55415	8000	The_Armory.jpg
288	Surly Brewing Festival Field	520 Malcolm Ave SE, Minneapolis, MN 55414	5000	Surly_Brewing.jpg
254	Amsterdam Bar & Hall	6 West 6th Street, Wabasha St N, St Paul, MN 55102	500	Amsterdam.jpg
265	Day Block Brewing	1105 Washington Ave S, Minneapolis, MN 55415	250	Dayblock_Brewing.jpg
251	331 Club	331 13th Ave NE, Minneapolis, MN 55413	150	331.jpg
279	Palace Theatre	17 W 7th Pl, St Paul, MN 55102	2500	Palace_Theatre.jpg
262	The Cedar Cultural Center	416 Cedar Ave, Minneapolis, MN 55454	645	The_Cedar_Cultural_Center.jpg
289	Terminal Bar	409 E Hennepin Ave, Minneapolis, MN 55414	50	Terminal_Bar.jpg
285	Seward Cafe	2129 E Franklin Ave, Minneapolis, MN 55404	200	Seward_Cafe.jpg
266	Driftwood Char Bar	4415 Nicollet Ave, Minneapolis, MN 55419	100	Driftwood_Char_Bar.jpg
253	Acadia	329 Cedar Ave, Minneapolis, MN 55454	100	Acadia.jpg
281	Pilllar Forum	2300 Central Ave NE, Minneapolis, MN 55418	100	Pilllar_Forum.jpg
252	7th St Entry	N 7th St, Minneapolis, MN 55402	250	7th_St_Entry.jpg
271	The Garage	75 Civic Center Pkwy, Burnsville, MN 55337	350	The_Garage.jpg
283	Resource	512 E 24th St, Minneapolis, MN 55404	40	Resource.jpg
270	First Avenue	701 N 1st Ave, Minneapolis, MN 55403	1550	First_Avenue.jpg
282	Red Sea	320 Cedar Ave South, Minneapolis, MN 55454	200	Red_Sea.jpg
268	The Fillmore	525 N 5th St, Minneapolis, MN 55401	1850	The_Fillmore.jpg
261	Caydence Records	900 Payne Ave, St Paul, MN 55130	50	Caydence_Records.jpg
298	Zhora Darling	509 1st Ave NE, Minneapolis, MN 55413	200	Zhora_Darling.jpg
277	Mortimer's	2001 Lyndale Ave S, Minneapolis, MN 55405	250	Mortimer's.jpg
286	Skyway Theater	2129 E Franklin Ave, Minneapolis, MN 55404	2500	Skyway_Theater.jpg
\.


--
-- Name: Show Calendar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public."Show Calendar_id_seq"', 4239, true);


--
-- Name: bands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.bands_id_seq', 1792, true);


--
-- Name: people_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.people_id_seq', 1, true);


--
-- Name: peoplebands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.peoplebands_id_seq', 1, false);


--
-- Name: tcupbands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.tcupbands_id_seq', 80, true);


--
-- Name: venues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.venues_id_seq', 298, true);


--
-- Name: shows Show Calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.shows
    ADD CONSTRAINT "Show Calendar_pkey" PRIMARY KEY (id);


--
-- Name: bands bands_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT bands_pkey PRIMARY KEY (id);


--
-- Name: people people_email_key; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_email_key UNIQUE (email);


--
-- Name: people people_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.people
    ADD CONSTRAINT people_pkey PRIMARY KEY (id);


--
-- Name: peoplebands peoplebands_person_id_band_id_key; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_person_id_band_id_key UNIQUE (person_id, band_id);


--
-- Name: peoplebands peoplebands_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_pkey PRIMARY KEY (id);


--
-- Name: show_bands show_bands_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.show_bands
    ADD CONSTRAINT show_bands_pkey PRIMARY KEY (show_id, band_id);


--
-- Name: tcupbands tcupbands_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.tcupbands
    ADD CONSTRAINT tcupbands_pkey PRIMARY KEY (id);


--
-- Name: bands unique_band; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT unique_band UNIQUE (band);


--
-- Name: shows unique_show; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.shows
    ADD CONSTRAINT unique_show UNIQUE (venue_id, start);


--
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (id);


--
-- Name: shows set_pilllar_default_time; Type: TRIGGER; Schema: public; Owner: aschaaf
--

CREATE TRIGGER set_pilllar_default_time BEFORE INSERT ON public.shows FOR EACH ROW EXECUTE FUNCTION public.set_default_time_for_pilllar();

ALTER TABLE public.shows DISABLE TRIGGER set_pilllar_default_time;


--
-- Name: shows set_start_column; Type: TRIGGER; Schema: public; Owner: aschaaf
--

CREATE TRIGGER set_start_column BEFORE INSERT ON public.shows FOR EACH ROW EXECUTE FUNCTION public.update_start_column();

ALTER TABLE public.shows DISABLE TRIGGER set_start_column;


--
-- Name: bands fk_bands_shows; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.bands
    ADD CONSTRAINT fk_bands_shows FOREIGN KEY (show_id) REFERENCES public.shows(id) ON DELETE CASCADE;


--
-- Name: shows fk_venue; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.shows
    ADD CONSTRAINT fk_venue FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;


--
-- Name: peoplebands peoplebands_band_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: peoplebands peoplebands_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.peoplebands
    ADD CONSTRAINT peoplebands_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.people(id) ON DELETE CASCADE;


--
-- Name: show_bands show_bands_band_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.show_bands
    ADD CONSTRAINT show_bands_band_id_fkey FOREIGN KEY (band_id) REFERENCES public.bands(id) ON DELETE CASCADE;


--
-- Name: show_bands show_bands_show_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.show_bands
    ADD CONSTRAINT show_bands_show_id_fkey FOREIGN KEY (show_id) REFERENCES public.shows(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: musicdaddy
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

