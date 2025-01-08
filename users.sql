--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Homebrew)
-- Dumped by pg_dump version 17.2 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
-- Name: users id; Type: DEFAULT; Schema: public; Owner: aschaaf
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


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
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aschaaf
--

SELECT pg_catalog.setval('public.users_id_seq', 307, true);


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
-- PostgreSQL database dump complete
--

