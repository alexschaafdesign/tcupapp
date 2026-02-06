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
    event_link character varying(500),
    flyer_image text,
    id integer NOT NULL,
    start timestamp without time zone,
    venue_id integer,
    bands text
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
    band_size text
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
    music_links jsonb
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
-- Name: venues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venues (
    id integer NOT NULL,
    venue character varying(100),
    location character varying(150),
    capacity text,
    cover_image text
);


ALTER TABLE public.venues OWNER TO postgres;

--
-- Name: venues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.venues_id_seq OWNER TO postgres;

--
-- Name: venues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.venues_id_seq OWNED BY public.venues.id;


--
-- Name: band_images id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.band_images ALTER COLUMN id SET DEFAULT nextval('public.band_images_id_seq'::regclass);


--
-- Name: bands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bands ALTER COLUMN id SET DEFAULT nextval('public.bands_id_seq'::regclass);


--
-- Name: people id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.people ALTER COLUMN id SET DEFAULT nextval('public.people_id_seq'::regclass);


--
-- Name: peoplebands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.peoplebands ALTER COLUMN id SET DEFAULT nextval('public.peoplebands_id_seq'::regclass);


--
-- Name: shows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shows ALTER COLUMN id SET DEFAULT nextval('public."Show Calendar_id_seq"'::regclass);


--
-- Name: tcupbands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tcupbands ALTER COLUMN id SET DEFAULT nextval('public.tcupbands_id_seq'::regclass);


--
-- Name: venues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venues ALTER COLUMN id SET DEFAULT nextval('public.venues_id_seq'::regclass);


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
-- Name: venues venues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (id);


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
-- Name: shows fk_venue; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shows
    ADD CONSTRAINT fk_venue FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE CASCADE;


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
-- Name: TABLE venues; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.venues TO aschaaf;


--
-- Name: SEQUENCE venues_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.venues_id_seq TO aschaaf;


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

