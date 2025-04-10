PGDMP  '                
    |            venues    14.13 (Homebrew)    16.4     f           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            g           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            h           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            i           1262    16384    venues    DATABASE     h   CREATE DATABASE venues WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';
    DROP DATABASE venues;
             
   musicdaddy    false            j           0    0    DATABASE venues    ACL     )   GRANT ALL ON DATABASE venues TO aschaaf;
                
   musicdaddy    false    3689                        2615    2200    public    SCHEMA     2   -- *not* creating schema, since initdb creates it
 2   -- *not* dropping schema, since initdb creates it
             
   musicdaddy    false            k           0    0    SCHEMA public    ACL     Q   REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;
                
   musicdaddy    false    4            �            1255    16492    set_default_time_for_pilllar()    FUNCTION     `  CREATE FUNCTION public.set_default_time_for_pilllar() RETURNS trigger
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
 5   DROP FUNCTION public.set_default_time_for_pilllar();
       public          aschaaf    false    4            �            1255    16488    update_start_column()    FUNCTION     �   CREATE FUNCTION public.update_start_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Combine date and time into the 'start' column
  NEW.start := TO_TIMESTAMP(NEW.date || ' ' || NEW.time, 'YYYY-MM-DD HH24:MI:SS');
  RETURN NEW;
END;
$$;
 ,   DROP FUNCTION public.update_start_column();
       public          aschaaf    false    4            �            1259    16453    Show Calendar    TABLE     +  CREATE TABLE public."Show Calendar" (
    date date NOT NULL,
    "time" time without time zone,
    support text,
    event_link character varying(500),
    flyer_image text,
    other_info text,
    venue text,
    headliner text,
    id integer NOT NULL,
    start timestamp without time zone
);
 #   DROP TABLE public."Show Calendar";
       public         heap    aschaaf    false    4            �            1259    16475    Show Calendar_id_seq    SEQUENCE     �   CREATE SEQUENCE public."Show Calendar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public."Show Calendar_id_seq";
       public          aschaaf    false    211    4            l           0    0    Show Calendar_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public."Show Calendar_id_seq" OWNED BY public."Show Calendar".id;
          public          aschaaf    false    212            �            1259    16435    venues    TABLE     I  CREATE TABLE public.venues (
    id integer NOT NULL,
    venue character varying(100),
    location character varying(150),
    capacity text,
    contact text,
    notes text,
    parking text,
    accessibility text,
    owner text,
    tcup_rating character varying(50),
    min_capacity integer,
    max_capacity integer
);
    DROP TABLE public.venues;
       public         heap    aschaaf    false    4            �            1259    16434    venues_id_seq    SEQUENCE     �   CREATE SEQUENCE public.venues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.venues_id_seq;
       public          aschaaf    false    4    210            m           0    0    venues_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.venues_id_seq OWNED BY public.venues.id;
          public          aschaaf    false    209            �            1259    16518    venues_view    VIEW     �   CREATE VIEW public.venues_view AS
 SELECT venues.id,
    venues.venue,
    venues.location,
    venues.min_capacity,
    venues.max_capacity
   FROM public.venues;
    DROP VIEW public.venues_view;
       public          aschaaf    false    210    210    210    210    210    4            �            1259    16522    venues_view1    VIEW     �   CREATE VIEW public.venues_view1 AS
 SELECT venues.id,
    venues.venue,
    venues.location,
    venues.capacity,
    venues.min_capacity,
    venues.max_capacity
   FROM public.venues;
    DROP VIEW public.venues_view1;
       public          aschaaf    false    210    210    210    210    210    210    4            �           2604    16476    Show Calendar id    DEFAULT     x   ALTER TABLE ONLY public."Show Calendar" ALTER COLUMN id SET DEFAULT nextval('public."Show Calendar_id_seq"'::regclass);
 A   ALTER TABLE public."Show Calendar" ALTER COLUMN id DROP DEFAULT;
       public          aschaaf    false    212    211            �           2604    16438 	   venues id    DEFAULT     f   ALTER TABLE ONLY public.venues ALTER COLUMN id SET DEFAULT nextval('public.venues_id_seq'::regclass);
 8   ALTER TABLE public.venues ALTER COLUMN id DROP DEFAULT;
       public          aschaaf    false    209    210    210            b          0    16453    Show Calendar 
   TABLE DATA           �   COPY public."Show Calendar" (date, "time", support, event_link, flyer_image, other_info, venue, headliner, id, start) FROM stdin;
    public          aschaaf    false    211   x        a          0    16435    venues 
   TABLE DATA           �   COPY public.venues (id, venue, location, capacity, contact, notes, parking, accessibility, owner, tcup_rating, min_capacity, max_capacity) FROM stdin;
    public          aschaaf    false    210   a       n           0    0    Show Calendar_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public."Show Calendar_id_seq"', 852, true);
          public          aschaaf    false    212            o           0    0    venues_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.venues_id_seq', 57, true);
          public          aschaaf    false    209            �           2606    16478     Show Calendar Show Calendar_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public."Show Calendar"
    ADD CONSTRAINT "Show Calendar_pkey" PRIMARY KEY (id);
 N   ALTER TABLE ONLY public."Show Calendar" DROP CONSTRAINT "Show Calendar_pkey";
       public            aschaaf    false    211            �           2606    16442    venues venues_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.venues
    ADD CONSTRAINT venues_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.venues DROP CONSTRAINT venues_pkey;
       public            aschaaf    false    210            �           2620    16493 &   Show Calendar set_pilllar_default_time    TRIGGER     �   CREATE TRIGGER set_pilllar_default_time BEFORE INSERT ON public."Show Calendar" FOR EACH ROW EXECUTE FUNCTION public.set_default_time_for_pilllar();
 A   DROP TRIGGER set_pilllar_default_time ON public."Show Calendar";
       public          aschaaf    false    216    211            �           2620    16489    Show Calendar set_start_column    TRIGGER     �   CREATE TRIGGER set_start_column BEFORE INSERT ON public."Show Calendar" FOR EACH ROW EXECUTE FUNCTION public.update_start_column();
 9   DROP TRIGGER set_start_column ON public."Show Calendar";
       public          aschaaf    false    211    215            b      x��}Kw"I��Z�+��̩���G�#	�H�	�P(�No�8n�?��Umf���Μ9s�׳����/���2�CDV�������3�k�a�af�<2�e�d�k�TJ��Js;�``����{�q���gf���\=w?w�m���\4:-v{uq�?0�G��G�[���ww{ѼꞱ^�{��TJ��O��5�J�5��RN=S͌��l���`<��\<�b�^P˼����S�2�w-vɿ	v�?����<���g���J���̛�ե�5\���X�&wG����]<�n5�l�4�8�%?Q.g>������X�r��{Bh&t�<ۜ��b"܃�q��fj%�8�|W8�)��c{�z�l&���f|�'��U�S,O�s�p�i�c�<1�󟸗���OT��e^صG�]
/z��B��ι�s*J�|�8��Ɔ�	?�F�/:�r�ԞȃJj�Or;�k��邵%-���G��P����p����?���vm����|1npp��*��{�s�y���R��,eдá�]�.<,�um��f1C谤t��(�C�,�j'��{�"{3�ڢW8��������Ր�������(E�f�F�\ �x���s�Bz#!C���-�N��'=e�x�����v�Y�2�ؽ�1+�_�#@)�7���d���,S�<�)��d)@�\õ�>�Y����{~�u��឵��|�Ӝ��<;N3�]��q���*ώSdZL���pyv�"�)ώST��ȳ�4�q��8͒�O���y��˳�4g�~yv����g'�m��<;Ik*?B���u�]��I��(yv��˅��I�)�yv�"��K�US;aoyVM��N��L
˳j����g�4{�U�UӜ��<���.���ʳj�2,$Ϫi�pwyVKk?P���
��!�ji>���Y-͒�O��Ҽ���Y-͙�_����wʳZ�|�K��Қʏ�g�����<������g�4_.,��i��#�Y=m*�N�6,��g��1��<��5��򬞢��Y=A�&�3���W���8����矟l��OC9�Y�4�y��#������OU�f-7�m�:h;0!|�ϰ�g��~p����언�/�����)x�c[|���5G����ci{�?Wh�mW�6�88����R��¸�M6g�!A��P���l��[`8�]_���TZ���6�K����Z��ٝ?��+����3<����j��ω5��(�k � B����c�Xp�O���O�N[������{�n�p���ʁ�`��tf�K����^�;�N1WC74t�	l�Y�x�����l�܂�	<q���s� ��z����Ufg�jŲ�!��۫z
�s�}y̽(z��[s)-��7�_wa�b%�ՙ���{C]A���Nbxf~��4��`G�P�θ�|Ͻ`oa��+����}l/u�g���5��=��$W��A���Ȏ���Aܟ��'��߱~E�-|:�i���)kD��az*�J�j�D`ל�OEW���h9��>�bU��T4DSًh|>5F�FO�p��~�=�S'�|D�T�Em;
�P�?���,=�Q�.��I9�Fh/��[t@*�����j�z�ꈭ$Q���޳�y_J�oA4G�a���D���v@�n��X��]���b�v�տ{�?1�ױ���T���66lw��@����ޤ.�*����8����_����7��W�{������d*��`���`�[Zo����
�e�T�l*??�m��\X���X���Qx�1H�݊�����#ud�RM��)�t�)�C���}|{����1��0��O�O�'��^:���]_$	U�Rx�j�Iώ���F���t����9�XPIG"OO0��d`D� x��I���b ٽ���d��x{5�dE*�`7�{P�BƔJ��=��vq:�
u �>�"އ�ǡ7�ɀY�����I��@q�D�߄
E�����lw�'AbCG�Њ�9��Ьg�D�"ݼD�z���SvfQ�'�Ư	����z��3g7Q��m�����Ѵ�#�s�T�K9����
��aW�'���Yh�Sض�k>\ݱ�N��|�Z}�"��&^�4N��J��,�ҳ|������؊�щ��e��Y����b��#�@1Y	!Xe��IM�j�@�na�ô���)����.�@��QuD����Td���y�������z)5���{m��3�����L�����Q/�Vz��ČR��Ī��+$8T�z9	.�'�G��DƂ�	�ӟ<��R�	G>p� ������͗P���0V�t1Cp�<�i�>t�>ӗ��K��6����t���S��}�$�:M[}��U�٬��g����Q_'�q��E시���J��� ��^)�g�0�γ����`�c�5��Q�!�~��4G4"���v'��~��°�V�RPk�I~)�OC(>v���,R��X83���)����gc�
���r��S�=��T#-��8:�8ct�x���sи�1Г�@s<�����O�o��ɖp��{BK�תl��U���4[ۋ�`T�y^�~�7k[�I6�JR\�����߱^�ž�=��E��S�+�=�>�����vA�"q���z r,���J�X� E�Ic��6vd�����1fܛ��<T<��� �j�����8d���/���~��7�7���|J�������qP)Ų�\֎l����2ĳ� ��;���| �`� �����tb�Q@���s�Z��/��X��Mͤ�E�Ӗ�p�]���V��:벅���N�gc���o�3�ή�ؕ��+�M�1��i�pĊ�錻��㵅�`���v��)��t���Ă�"�\َ_��Q(���i�}��i@�e7͏�>���O��q��Oz6��}�d�΅����w��?��MoẬ�	��x�س��U!���������\�K���ǭ�C�I?ٮ�`m>_\;9h,Ĝ|��Y���a
�Ҋ�9��.����)�7���Д��S+��>�8.!_��ct�y-Q/e7�	���5dg�tj���&;��品��	�6#?6t}O��*��/�T�>t�)����%,b�p��'�pD�kˉ�����^�84�jꛡX��ix��rf�/����;��YgxK���c/��!��O��[{b�����
����YY�F�/���(�)�zc�Hg<u�ܥc~3���Sήi�4�����ݼa;�b],:���ƥ�����q��Z�RK����cO�H��2kΓl��@*��D���QAG8�O���O��C��U���R�%�K�^�v@����z�1TGu
�<T����x���j`�c���M]�;1uH�'I�y��y2T�@z�<��%���S��$w:�@�N��<��`P�ѓ`X<�����ã�:	��v�G��^Ɂ�S�u�Zx�q4��r�x{}���Nh>��l��ͨ,���D���a�]���)6���x�O����ʃx�Mj��*��Jõ7�˭�d�h�z
^y��n�!�5�R�� �ax�������xp{JԹt�ҏSa��R��J��cy)���i(C�BmhGiQ{�M�m�ǆ��7�"�M����-�-R������rg>{�LB�*�9��`.�̈́�.�Q�����cj�R��#͗�Tl�0�Q�gn;�������z�i�����/���s�˚��3f0:�e=�NE{�Niĕ���X��;Ik0�6���O�(%��%�!#q�a)��93�\�6
W�$�����`�;��*F��p���>>Q�?Qe��e"bJ[G�� ���eC�9��P�"�ԧj�O�bry����͡�l�u�m�H��@�\�A~`gN!����8��DMCI�x��{9������Ц�%E_���X�	!�U��.�`���4�����z~&���8Ճ����f�{i_��4:�;�+�?�f�˘������ɭQ�4b�8&N[���Ĭ���QO��s�ǧ�'H�m����r�|��D�
q�Ч��    �ed?�j�</��Վb�c�h��/Q]7C���t~_�Cy� ��' 1H���շ[�[�f�]̪f�j?�,�@G1c15�����&�]����}�K�����I\�\%ƀ���Ŭ�S)����]���� *QW'"�Kc>R)e_�`ޣi
�P�����]H�M��r�>y\{3
H������ݝ�Ei��'N�4�I��Je�˾4:��ЋX��S�D��l
��f4��7���0|��Ǧ\��҄���&+�?�a 5ހy`?	��yHbv&����J1��j�YʯF�E6�ʫ߰H�
=A+# KOP��"��b��v�O9.Y�%>ֿ�5�,�妟��l `�@BPh�Ei�I΅p���'3���K:�0K*��P;^r&�\��� � �d(
�^���,WS":�d&��e<�2Z)�нŋ���n�O??9�}�:4,�&��t��$�aN��S��%c��x(S@����#�E�z+|�4N�h�8�K3i;�5�"Z���
�9��dj޳K�C�Ŕ{��i}��5��=�!&���\�H&ߝ�}���X7+�5q�?.%��0�4���9�����4QN�l��?���0�4�{�*�	3M�1�˳('�.]��H�('�*��a����z�%���0x4��C.̄�!��+�L�2�]�wJ��0\4t�S���0Nt�R8i#� h��^Yf�a*"K�(�3O�IG��Ȳ�t�j�y���TcdAF[F��w`|B"ԓ*B^-J �g���E�M) ��oS��Kt������[�Z�#�>zT�Ȣ`�m�R�gx���>U��z�*ʉ��͸"��_xr8�����t(�Lʉr\�	)��s��l�-���˫xIof���1qr����k>>�E�E�ǲ�䂜�a�*b@ٱF����Щ�S���φ�'ތ��<N}z1F�VD�G�ɤ�(�T����P��W>���#t�r�Z�A%�~zZG��SLß��:�Gx����s�z�.߰<�W�;f\� �:JJGa;*����}m0|HÑs��Ê���I��7�2�x �6d[A%��(���r?�r������୺����pRM�9W:��<�����5��c��<��.{�f���jD��7�ȗg?�w�
�-��ڕ�$ҨWN�\��hd�Q�Z�n�UVG�$�u��zrƿ-������\K5�䢲�L�^L!�X�9�a]	�T��8���OO�:Gy�)�OM��7b5V9)���.y,�� u=���d��a�E~@�T*�Q��۰fJ�Qd�����A�?�n��<<a��*�8��~9^��P�-��JX��$��a>;��(�o�;|F��9��2ih`(�[\	Z�ub�6���bvH�(�Olr2�h����(�M̍gn�x�絤SR��F_m�&=��gn�ܦg~>�g���V��"?���gO)p���X�	`i����,�gN��+;q@E���+�PX"���ה�bѤ�Ƶä:�O��ܛF���#����b6�c-�o��Y�)���|����)�n�{�v�um��Oo�]����C�E���� $!����qZ�7,r�����Caq�5i`�3>\O~8?	[8���9��ݓJ>����p`�3O��cL�=�A`a'|1�[�c���8"<I��g�r�r�o_n�(4�f�ƃr�dA�J�Ljk/<{�;��iz�қ�*��2,��|:�VA��;�M����G_:�``� ���cML[S5�Ռa�S��1��4Ythm'*Y��~��O�k�Q�f���t�4�S)�(=���$6F�g8F��^z0-(:��uKQi3[��qJag�h�+�Qf�ZZ�+v��]ݶ���#*@���6����~A�JȚ��5���&!����\�F���Փ���U�^�=�ƔS�(�|���q�3:�-.�<��M&����ɽvIm�q����������%��x�C_w��5���tY<��z�|HO~�~HB$���H�@N��1 ��h2�OP���]�| @�ہ�bvEj+%r�/!w(�I�]��1JX��o�	Y'��w:���a�O�is9�1�P�An��P�;z�9��5��x�Y��#��x�������X\"��Z.H�t���_S,�ޱ]�0�s�)w�x>Ȏ[�l���؈�a�u�z�n�R!�z��b���H�(�(�xf��At����%��sP�qPN&��Uen�Ӂ�Y��8bqA���:4tI]`%�� S� �X�?��_�(������2>/;��A�'���mf�����
��yǈƹ{Ȯ��)�o�>��+�b:�F|T0f�լ0(9���*-׫u�*G�(Wz���Q?���]� G�rb�� q�MF�"�%�S�6�A�J&K=��GaRJ�?��+C��@aҼ*$Q_�Bpc��I�h�����,�w��_���rc�n�Á�3�1O�a��͒&�,	騴��jd[�10;xJ�� w`�����JW~vH �G=1����f*���-�{bJ{�N��\NEθ7��	¿��弰�<��OaW0�C2@db
)'���(���IO����G0�jrty����e��i�� 
F�),paX;�b�a�ž,-s�TO0�;�ºx�=�Q�
�"��*p���	LG)� F�������r��A�ہ��BE��c���R2yLreHņ4i����R�A9�	ϊ}w�h�)l�{��曗�욝R��ʝo�a��,S)2�5Y�'��������A��#�f��ݰD��5%�S*��8dg!�	_�j�����w`����zQ�' MD�hܾ�R���R�FtF0��SQ(��B{F!�X�U�غ_Z���<���J
h.�����J��U��|:+�����=�(����%�h���|P�ɘcg��*)ی�l��N�	孰�Oّ����L�A�媝�����㈼�R���Dz��5��Ͻ>�|������Ky�'�@�D���: G"�S��P�x�/B?����cK�؍-|����n�!�?K�Cc^|	@�t�kPr�X[��H��y�����wBv�{8.d1�݉�O���=�Yo��ɎKہ�i��S�݈�,� y����̾��k饭:�� IO<NG��h'�ՠ��ȳ��ړN�����##�33��l|��Ӝ�҅j	]{C!U
�:[Gd����
L��!{pU\᱙`>0r5��S�9+�*�x��k�4Z�+�7
��5�v:[��wйj%�p2�Ja��$d�0�S:�e�"<uԦ�눡'��|��(ʠ��p5�~�~9�?>�T��GO�^�4����uZ����:29>�>�Le˞+ķ��� Q�|r����ghgW.k��FG��	ɠ��eѨ�u?�@�)��0��
bLe9ok����Y6��vL���*d��L���Ai�scPU)xY���~��F�J���)�+:=�0+�a��*���Wi4�fԁ��@T�	ђ�]����0A,���6��7���za`�s�	��}a���5d)��
r:���ϣGaކ.9è�����G�'���>�T�]�|�N
�^�y���ß��R�����5	)�]�y\ZR7Q�Neo�b��t��1`]$����c��0�� d&�汀Ѿ.QR�䁶��O�H����=���c�6��ٍ�!1���S�BaX'�f�e�yCv/<UR�OXAgt�2ゝ�T
4a׃o*o�h%�2���+ܢ
�_51�P��-u�(���2�rq�iP�[��:��RM��ok\N���0E��s���=s���8��	,���ʥz��� �l��q��H�..\,
�2���LTCL(�l��� "eLA,�$�����u��1�%F��tkz�WQ�4{�)L-@U+�jYppAǬ�ː6 1��qO�N�AQ8�@�����sEըή�5'o{7�
sf��ĚN5�U�R��rP��2��,:Ҽ�`��^a'�g�d�����"�P} ����;���5�kU���j�����̣Rnc��buQ��e/�]Mgz��S�&$F�4���i	f<w��vUM݀�b髊�S;��v@JU�    ��WR4o��Q���U���-�x�ݡC���5V����\�z���_�E�x>{p�Q�bTR�,��o�������u� �JNC�s��4W�h���ZX�#�d�϶��p��D9p�CK��P�H-MB�ع����8�4X��N�.[��j���xt��VE]0k�ɠfl��3�+?}"B4E���YUA(W�;��t�A�E(�a",�cһ�5Qؖsmv�ؚS?4��j��Vpf�Ĺ�p8���0;���l7J��$��4G�f���4��f<���q+�7��ƻ
�٩�a��_�A�BS����(���\+%A�����BJ
�jJ��t��)K�V.����_B;���ע��G���xV��|lh���F=T����v��#�Ui�>����'��BM�Ҁ:lvz~��W.ê{m�q��7Z=�*ʓ-P�%ru�t�!-�1��S<rhj�o7F�gzÒ6P}�����\Jj��ݻ��Kֿl�^�*V���:��).��S�T+5n}��U�0��0u�Wv�O��_���`)�iTʜ��\�Q+ � �5Ay���;X�g�]���HgPu��T��=�mՙ�r��@^� ϯx엵�yHA�)&��g�gt���W!�M{4�@^�=�2`�JU���:�ԳS�حTU���bMj��r��M`�;�FO#�;�4��M�tTJQ�#_8���n/l��7�I���	���� �Rg>�<ɐ������Rig>H��j������@��`����}����>�H�k-H;��LF��
svR]�2��}�J�Q/`6���[?��+�!�T������hN����]	a*�(�>�z�]h���N4��e�QB)숅����b��B�Q���i��%�^�����S�[&e�/(�c���=��T��X=!`4)͌��T���z�
�Υ;Jf�fb�N)g�}��O�A�^�إ�<�h�O����vNe`,�QXϖ������Vԫ�?�A�;��!U<q�pæ�+�$9�*5>���-���4I�q#FP+<�-�˔�C��֤^�E���v�����1�\OX�3����#�-b��b�{�����IU����^�3���[�_/e �j��^▢>!�l�C'�'�]��A  U1D[]r`�ܚ�ņR��e���K�ߎ!QE�SL���X���Z��-����w�ή�$!4Eo�h�&l�~�=��>���	6��e�g7�w�*k��ܷn���vѾ��D����p��t�8�5L�{0�M�3]���{y;T������UA��f�<����?�	!�U*�ŋ|)�3
1[���l���1�獜�+,-����s5�d[H�t�_��x,.�M�8��`���N�!�Oإꀯ&x��iaf�CQ�v���a�w.�&]���kOȘR��r��?����2y5!��VD�H>�����z3q6��L�ØCe���
E1˛k��n�n��ҵIW�*����B]��R�f(���T��7�9�D�{ͱ�����ز��t9�'g6�<T^�K?b��piU}�����T�]ݚǇ(����t�-�k��z{��򍮙�����V��_����R,]�Z2X��=���΂�5g2|�F�A覹�!V/%���Gh]J�D���{��E�8�W5�^U-P��\��k|7xG=��r��f� ���Y׻�s����r(�|�,6u�pB�I܃�J���O��m��XG�{�$�Kׅ�.l��@R�t�`��������ta��d������~t�[�@|{]!���;�=Զ�F��INA�ڌ�_чR�W=������7�x�h�/!a����7W�~����!N��͆�;)�T^.�l�RZ����#
����oC�I�����N��5(5�LTH��/Sh�QE�Jl�P�w�G��T���L�4�h�I ߱g2Jj��
��ľd����?�}�糨LT�0���\z�A��iQf0�]j@�_騩`��:���龷@�k�>���Qy"3QР�+�ƹúR�@#���1{(]{��)ty�g���׋; �lA������������ 4�Ilփ.Bhc*���f��R�zC/t�c�hڄI��r��&wᒚ�f&��;8ZG�+��U~��j�W�+r��Q�8���şr]����6�O�UEGՓ$�̾3s��t��V*jF��ݶ=(FG�ACo�/�� S�0����n4:��i�K�ƍo��j�s�f�g��� )�]p�\|��o������/ѕ�tT�/��!��=���d8���mX�E7Q�x��Z���P�q:���٫L���P3e�!�~i�}�Ay�7����P��8�����8�8��m���+y�|�̪�modF���m&�b�[ɩt�k�������x��f����f�p��q��gО���ک��$�`>���R@6&�ڂ�ն�d;b�}�KM�獐4Hr���pt��|����Kg9k��S[NMm�'�W�h�7�?�X���ӊW���c����z��2���q�&2�,~&�Q.�_#?��[K�K?䭭�37 �Ja�?J4l<yԋ���v��jXt�&��ޔ;�a�/%�)�Q�?� ��cfF����y�h�]��b7W ��ŝby�J#Q�N*ե����O�t�f]�F;hn�f�&qO��V"`8w�e.�{����RP#���)�TH�^p��n:L�2u��8�`�4v���Ƌ�����JBd���A�a0"]7�C�Ŧ_�&�{�Y���� �R5��Z-�3O��r���ہ�p�!D��ʣ��2��	]�Ld}/�7���@J{���0��e�9���]?J���|���}��AZ�*�)��-���Jz˗����[�ꥭ�1KEH�,k��E�#�+4>��-�~�^v�Xҙ��ǳ!����yQ\�������q����}�=3� G�I�PN����������ލ�i�*T�	�?U�T���^)�M�.�:5��[tr����(��{95K�20����?^�|ҿb�6���i� �bzs��b�+�����x;�D��条*���~HL~uM4�q��2����hݨd�j�XP�E�T��ﻛ��O��jxe#pU�S���'���Þ�`��ޔUwn��5M�3�J�����@u<�`/������t��0\iì������ˢ� ���"��AvK¨������
�.�8��
�Ζ2GJ�tw�*�k7"T��17���z����VOR↭~\*%����'��7�TEcˑ'w����Uf�u��vL��q
u7d�0!sу�rc���}�r��E�YX�u#�S�y0�����`-�����e�>vzzBVV5�>n����1��p©v�������R����b�QI����5Ft��*5�
�<��=ݨ�hS�R� ��.��U�o�5!�^6̐(�X��A���([��z�f�89�<�ԊIcE�})���_�I:-�<)gż�G�36�IjH9��dY�G���lO&pK<�`8�p-圉��zCL#!Fs~Q�����x�է�)�1q�ح�2�ؾ�:ѝV/����ѡ�
ƞ:d�!�S�y{�B��[%�_J�p�@TR	Dw��?��^K� �J��Ge8瓲�>��F%>��Au�R�\~RJ߰���l�t-��P�P86�D�:|����Ċ����X:�����u��FĈ�^s76dF��=��G̸#�7���)2~�z�v�Ѿ��s����
�n��Ś�r>WǺwW�~����K���1�b!4�w��Xm@\�g}�#�s:S�m�Σ���c)w�ݐ*`��n�u���Z֜�R�U�sl����0e� ����1��@,�����z�5�CX����/�����TG�\v�q���T�4i���ܕt��"�rdFISo�m^��S��{�(�Μ�����|هuV}0�j<��@Ɍ��d�f1]�
��s@�32�м*b��p���]|RWgP!��/4�`���X�~;�V�Nhp�p����!g>��E#�ʸ=RͲ��S��    I_RC#knL��i�E妒nB�ӆ2���.��Y��;˧�f,'�Y�/3����lu���}(�r��A�M�o��9UΧ�"3�(O���ǧ!��6����#/T�]ǅ�����\}�Rt��߉k�j��K�rE�8s�N�H��8RI� �������R,�+�S�:u�BGWT���Fa�*�t�%'�>z[ݶ�� L���9�J��=א	����������D�J�.+o�*��/bAF������{�)򱪕����>�E]�'�&V���^59<ݔ�]X�� 3k��V�k��׋�Ek}�R�ɇ^��r$$a6�;3�m��i�m����"y>C���mv`r2V��A�R*�8ڳ�LU�(
����h]��^d<�7��o�����|������n�+�@�,���	�BB����TR��^^  !�j�C���	8�]�����{���]��vK�?Q%uJ�p�aU�����[bT�L$�0zw�~�R֑X�%lY�;�YtCDQ0�@���w�;�Z�Ȇ܉n�i.�&G?�H��t?z����G'4�}T�_AS�U"�i��,�jVyO5�$�\֏_*�����j���U�*���9�K�,��?��p�o��@�*|46��6���;�iBAk�6@��S��RJWH���F7>�*]���+����4�L9��/n�Jߐ�٧���@ۡ�
ȧ�X>��V������>y�K��t/{�y��0�.�MBL�@����si�(ݧ��:
���e�')�%u/��)��2� �f6�;3����u��������W��@Sa�N1����h	"�OA����9w�o�hV�Ry��Yy?ҫ�ꘉ��c���h�[�8�GQm�~]wq��e��_�t�N���o��n���ݦ3��Q���֍�a���55����&Gȅ�Q!��Yh��Y�S�B,O��8�B7��*��<q��%�>��L\Ţ:� ��CN�=_>�X��sk�y�á�� ���X�,"8�_��t��J��O8zO8JU�5�Lm߁�}�]Ó�^��.Z��z����L|�x���7�K7pE�tIU�Ƭ#�ŝ_^8`'�M��k1u�ǥ�x�7�I��Z��8!벡ȥt��*;z�����e޲�0���NYU��f`1�X򳷟� �����F7fs�0�Ic&]�=Ǟ�p��_I��
�B'���J����S��g	���K {Ju�����0E2v[��6�TK�M��� = #1��W�m���)Ր��\�c��5s�^1��h��J9��{Nh;�f��lk$�
O�ɸ_va���T3x��a��tś/�Έ�@���N���J~�b���b�0�k���z�[��S'0YO,�\�a����f��[.� B� �	�\��B�%dK�FUt�5TW�o�1��)��`��ٕ��H
9Q	]%�i|��I'_�خ��u�N�Gh�r]��W�j�����?�T̳XOxυ�}�F6�AKc�lB�q�FvJ��/�n�kf�ff�܃��\�����k̏q#�_�����I_��.d�k��i��c�8zu�suz�j�[�p�Be?��϶	��T�i�?��B���@p#ȹ��T �g{h���TT)�b�C\su�ٔ/�6ty���?�e ;I"���>���1�t��\��+:��u����D�.��%��p�QϨ�(�����xRێ�$m ߪ�c�*���j@q� =i,������R�A�@O���LI����� G�I�]�� ��V�ݕ��� �P.�� �F�T4���T:��b�c��]�s����<�.�?tF�ݻ_�2i�Do)��H%�(�`��#�8yhEϩ�L*�6B�YHȄ�fj�[�����B�^��}g!!i�l5��,��a�"C���O��FV����b&wa�.���[��쮋q��)n��ݼ���,h����:�ж���`#�M�k<x,��0��G=���+w�])]Gd���(�!���]�Nb�K�\��R�Eo�<�b�#E�j?�T�>��e?�����'I4�	9N���t��@ɫUhFRRMA}�����ƶ�"S������k������َ�x����߯%�����h�����xae�
)��c��r֣&���N>������{bċ\,��R�����5�+���:Tk�$&�ܤ1ӽXyG��}{�M�2&���ӳ�k4 Ny;�j���h�5�``*�aP�^s=��Hb��g�$��P=�o��NZ'7<�6��p}�B�u��3�c�o��Jp�3����N�B��ZR�s^E2,/-��b��Jf2׈=I�MUB��T�M[կ�J*_^T�
�!�����-�4���ѹ`��cƜ�]���q4^@EYXCz��3ۧd,Ü������ځ�"�/TA�����No/�q!��Rt�>�C,IT�)ʴG�����\vYfp;�����Uߦ+B�e�����H	���[�BU�:W/aUB��F�A�Yn�Pҏ�_~:dw�����c*~�ԓ�`q��
J��-�ǇX�/ЧF?�U�
WtE�b��F��(cw]U�'LW��t=�sP��M�Hw��/��1'�tC@U�%�\w�Za�Q$Ȟ)1�Og��"G��L�4G](��h�z0	!*^�%��֖�����9a'� ���9�K0.T�Kћ����/X �r��t��Y7�'��ܯ��.�t=�a��3�!�K��U@��FI�����-{4��u��z�D�e��j=pyWX:�r�a���*Ε'��\�c��:�,���:�xʽ!�,��F} e%�*�ɽ�|U�*S�H�ʋ^O�z����^��@x�a�.�N�s�����J���1W�N�Ū��a��g��Gָ=c��Z�Yw�ӻN�Ob���y��=ԓ�1
]wC�����m��W��"*��U��5$��Ua,O�l��ܠ�:�:�ݮ�Dp��� �\�=̨����+(Lk|81&|��'Q)mv�&���`r���;�k
�Bn@J���F4[��c�ƶO� ���Oۋ��ѕ�v�T`�AmUf`3Ҕ����V����&�S�����tN���V�"��˔�r(�~�Ju��5�`6��cI���q#���n�-|uզ�UP&])��5�f��2�B��Ϛ�U���.�	+q���[U/�`�y0�yȹ��<�T���O�+u�c�uz�h���V�_�����9�6������&��$A���_e�
�}�b%�Y�"��(���w�Q�o23[���3��N���m�u)V��0���[Hc��աM�8�D�g6VR�~Jp���mQ4�ܔ��_� Ē1��WI��EE0�IK,x�}B���0#��E���lv����'h5��Ϸ�3�z"s��U�T��������pN����]���~��C:[��֥90�X ������tP4��bH��'Пߩ`��v0�4�K���\�z���F4��t�����:��V�el>᯲G9jBL�&	��_��X��
H�o�*��T0�\];��:/�Ax�j�zv��dPi���y\�n�!ˀJ?E�<��c��~��X����;xz�w|����'{-��� t��4]��F|<�"��J��h�[8���z��/��=*d�jg��=�*d����B���U؊=q
km�B�SXC��1�� ��j�u��˗��,�bFx��`�@�,ؽ'��!)��Ċ�W���Qa!1A�辬��᲍U�;!j�������g<t�1#Gc��tO����;`�B#VZI_�z�b͇���C��5���7�D���3������(f蹻L�U��ɰX'�\J	�pU�kr wn��
}��ݪv ����a����
p�����*��ҦZ��ǡo�����e5�k�<(�c>���kn���:��Rt~��Rux1��gw$�4O����*�*����4��� �@K��mv���^��g+��ٶ�.6F���X�"Ϝ�W��D���TE���EF�Ng{Gk�����<��JX��� K�|�sey�����{ָ-�e>s׷=M�� }   ߏ�����b���M�ʻ�wV�oߌ��r��f��C͌�B>����=v�g��"��(T�Q��#ඣ�������j����*;����|W���O:vU=�]
Bތ�{%a��?���]!z�      a      x��[�r�8�}F����8Ӓ,��tWM%���q���I�)�@$$aL��Zy��8�w�䬵RT잙~WlG$������d�>/�>���ڨKW�֬|႒����n������-k���j���گK��cu�>�{09R�f��7{]+5�����+s�+�M\n?�A�57V]��n������y��2�d�ޛ�+����V������u�~U�|ӛ�����_}�۪@SuU돦)T��:�fn�r�����'�����+U/,�qSil��虵z���+��ml1��²���sK1�y����d�=��ؐ�M���y����%�a%X�US^���]�����F�S���Z�LCD7�A���0��v�^n��me+gKY!�ӄ������OG����k����C�skui�vPc�n�a<�veBM]�L�_o�M�׏��72:6�M��>�x��84�6�B,�h,�[�Ȗ���%�h��}��*3��+��{���1zj���4I����0t���t^��F�.��u�.�}ŁO?��<2���/u�^���r�3LY����u)<�[A3�sQw���h��M��O름� �ܗ���rϱz�`�"�����BN�Z�Ǣд����
�9����~�Z-������ʠ?]�=kԳ�R#Ս+�2�՞M�ϧ����A����r61YfCpT��ٕtE�u���p�������gb!0����*����T�f�Ŝ/*��і%z׾���	|s��a~��_���V̙h#��÷����B�����s�ni�/.6�&��U�\_B�E��rc�*;�W�b��z�[�Su^�&'NP�9]Iq��}3�K|>_W$L�h6�0�4��k X�:�����f��_��ז{�p�g���Á���׫�p���9N)��Η�	�	�Ѹ�����F?��/b�6<�T�}i2n���X����n�mO?Q@�w�)	~J}�@�
#��i-+:�������»7��I4��r��/]�?�l�?����̀��)h��g�R������y޾���Nk5���tA;M肑���g��PS���L?�%p��	!��v��H*.5�b�6 �����8o
�'!��&.}l/J}��&@��J�-��n��=�;+Џ#��`��C�7֮���%(��o�3�+��T�ƕY��̒Y!�ʄ��t �,�ژM6��~E{	�����4��	˝[����o�~���u��/�-� z|r���?��e \�f��T��	�|���_c��ʴ-����!ZY�b����Z	ܹ����G�x� J���u,�!���|��2�n��������dm���u��b	�t��C �}����Pn���+Oha2�(2i1��	�Bb7��-`خ�!�H��8��o�`,�CS Hn����$����V_��qhV�:n�@#�'=�������?���4�(�U��/WE �*�?�9#6M�v�k�D0��_�1*u���_+��V~�q	}�J����&��zH��~��[��\Zv�p��~p���	�$��0*�Xq�F�ԇui����_;�Tg�7�!�ږnm!t���"�}<�!��m��iޔ4Ô7����'� ��hv�`��GM�an!�?�&� ��p�}�F?���
=��'G��@�X�a��ڌ�{9��>�n3�7���4�� ~�.�fڝ��!�A�:D�� �����s�(vB�ܴ�H�WM�	�1E�v�u8�����g�.?`<l"D�z<�d����*?su��� ��:�yn}ѐ�WC�Z����a\Hb8�6A	Roo��~S�r.�5�Cء� 3K��r�=sc�k<���%�ZEL!��=�LO��{�����W٩�2i�}N���,yju�f3P�2&�>�8�@��H�1(a������}���_��B��G�*��3Jw���"���⸏{+��rjCj?�.�tϡ���X1(knWV̰%a��_!�=������_��	L� "TgZhHF��C%x,�m�<#�u�d2�*�� ��f��n׎Ǖ0X�C�q�;d��MniRZ3��\��9�o�QT�HN����7)�@�Ts��+
��V���}�T�bV��4ҤE�'�e ��R�t^g)��2C)?�ycA+}����q͌wm���ч�}W��*rk��б�B����D߂@�`���*�	��Q��M�2��Yd\L"6+�IX
H��&���(����ȹ��8l-�!�mf69�3|�3jk���;��?��1T#*�f�d*�4 ���c�L2S�uXC���<a��KNZxC<A�&�9��Ǒ�$T��]"�PW"�)���I h�eD�A��-���Ky�	T�'mcJ&R�l����	I�O��&$�6U� co]@�׊l[`�-V�f��n�8f�,-�f28��U���4Y����CI	���>�h�� :C>��_1ò��b�!���j]y z��3Z���Ug,+*�;º'��d2^�X!����1^1�x,�X
� �1Ą�En
���OWH�))2��
�s"o�]��Lmt /L�/�>��b�]X������v��qҫ��B�D��E�G'n�g���U�y�^���`?.xHj��?���S�B 5S��!� 1^:Dw�������p�&��&A\�>�o��91�Þ)�\	���f��͢��T�wf�6rT����:�Y��I��י��ّ�;�u�H��'�G��u��`3+J��� p#qQ2���-fd�C�Z� A��m1��Q�Uhj#�2)f�>:�K�AU 9,w6�= ?����N���k�P����t�Pn
�)����@��
�y�6ӛ�#�bH��s���Y}S%�c�����~��7b0࢔@ο} =�����&��a,o����ɴ0��t }��b�eu�� �n l��F��e�n���>Tg�t���g~]Ⱦ~��Ⰿ/�%�R�ӳ�S�P����~��{e�OC�,�F�EJ�p&$�����g_KB˶G|����0�m�~<�g�
p���`��+ �z�dp�ɝQ�ݷ<�U�VWFZd0iI͙�1�s� ��*37���6�W��{'f�Tw� �o�Rإ!����	���,i�� E+g�"vZJ}m[l�e�J�KX>y9w��L��#�`M�2V,<�n&�����I�3�4R����ff����X�g��� 3m[�)�ڦ�B|��,�k�-�QY�K���s�R���]r�mU�]�l�E/a�H����ܖ�Im���.���)N\u�cە_�I�\���\u�����Hs�:�QD��	CN�Z}A�|�%��-�)���1�#}.�Ÿ���z2�?s�����Qd�qA�t�"�iVK�Wז�H��+�(��f��eΔ����F:3�o��C�Z�0����5����[���i��f�Ɔ���x�u��
�&�L����M{����8.3��X9ޖ�e�)��O�c�H�{�/# ���鬰�E�`H"��Ҷ�4g�-��s9�
�'b�q���X�~�V��ڝŁ��n��fS�c���	}�,D�"�5���I%�$�P�������T� -)[i�d���RW�3!qѽ�P(��{�L+)������K�x����X]�ʹ .�Uv�`��{�>�y���d��v���i�o^\"�y�B���2i�<}�6Hf��
����jr��sW+�%�������Q2��b�)&��VR���d��j�]c�X���1ü�乍�B�g})��iJ�m����Z�cH]H$�~+�I�V�����#c�6�g�mc�wӏ����w���th"����(-L�e�I_������%.�Kc�[+��6��m�`2�O��	q��'����#n�g;��,z�iO�+IZx�����Y�d2���2�wd�o�R���$@���v/K�-���=~6�p�EWFvӣ{�>RQ ��h�
��X�T�^�MłQG�����|0���2���*Rm�R�A"R��ɩ;k|R=�6Y����5j� �  )�l�G1�Y�"��ܸ<HyCj*�� V��@W`�.��n��$��] 3�U�v儨�,WD5���ua�����X��B�}^f���Q�FF�h��ŗX ��I�Z�_si/%\�Y�ʧ4��f���3Bf�Y�0�WQ8� �Kf���7���9t����.?���Ř�[9!i��)NZ}w��A���TϠC-�K�U?�,�M3��X�c�Zr�[��X�����e]�h�4ԩ�|F�K��j�5w\Ոt��	������?zG��ԭ%�S���]{��;�wro� J��T��")��������=)�}��tB��8|5� L��<VIn��H&{��T�Z�U���J�w<���Gc��R����[=�t���sz�����M�]� �.g��HM�5�"�^z4/V<��X���&�ŞT^��!*�-)&�	X6v�����VRo2�`�-�5DU�^�99���Xu%��=�JM'�����	w��Ϥ��|)O>L ���t���,Z�Ǎ�G�t�f���n��Lf�wwIR9���wﶡe���iT�
rO|nV��@����;E�]X�
m�`���Rߐ��l
���D��H� eD��M]Ì���7e6�]#;<P��⒪GA�g<S�� �s����]��T�%�_�F�vQ���OB4O<1R�Br�G�M�Y/��[��'�C��B���2e{�'V�N�_ZZ/��j%���Tw���?�"x;��ٙ�Gs��w������.@$�w��'�x>{���k��DpD�֓�=���H=<��X���ݓX��3��<� ƻ�!������D�O��߉����*���k���t/ZJ�{���^��4�P�iN�G�^^)y�#0���9UNP!����(^a��F�H�Z���b�d�tv~=� H$���#k��T�TUz1l+y��?�O~їrg{��᥿��0j�\��T�[R�����ۦ���g�����b�_7���!
�u�Ob�hv���E�El�?#��ƺ�=��+!�.^�b����_� Ai���]	K�f9���@�$9K���h���r� 	X6%����.��e��c�����m�!��X�Uփ������m�\���wSw_wW��x<�O���_#��E��MQ;��\U�����E����)�g,��|�MVn%IB�=4��dI!<T砭a�1{s3�gޑt��/�0����$p��|�ι#q�
�񈠢�As�ޝ��p2I�PH�2�j+��4��ӈ;m�a���B�̻;F`vK���7;���P]5@[�yP�X!�,�b�<��4eтw&k��}���d:X�f_}X6N� G��H}f��̕��zK����🷐6d
G�-	zA@B�������Q�@�]�^p>һx�u�k��w]�����*�HHn�E��!AX6�1<B�>��U�J9hσY8BHL��RyW�p{j�&.[��mY�5�X��}#�.�Z�}�����5مY�E���Y��V�.]�����#:erm'����X�m�Yb��QZ��"��"�&g��-H�f�r�¤��w�[�SL)-�O��;�*3dܽR_�#���I�Z�i��5t /��UhoR��Ҕ�=(�o���ϛGy[�2�r�����1�vk�7H�0]ȄY ?m���дb͛X��� ttg���mB9U-�����g��F�����f��h��8������`hb�n�J���z�Tp�ȧ<��м�.j���p�.�m�����B�j{�lSQ������8���z�z�~��Rg��)^���*4��W����z�v��C�����I�������Wp��{�~_<V���A_LH�v����+���,`Bz�|<Q�B�'���{�y���x�7k伉��l~����@�^
����|�����n���E����'�R[�%��zt�bZ֡���
!����-��y�zOʍ-�U[ �0��$�T�4F�+3$�^q�3��M��1��#���{)qw-�@�0s����y9�&�:�H��H=�07���^�Y�UO��Yó��O�!l�����}��/�f*y�3�bF%�L"A��	\S�o.����Uj�U���H��'�1=��懻.IA��� �b�|���Ǣ,��u(�?_Bl�ݠ�S�y�]��'j�{�	< {ɿMx�J���=Xxw~�<a���U��*h�C�S�8�uM����v��C3%-����pP|?�=x����˦     