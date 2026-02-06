// emailTemplate.js
import { marked } from 'marked';

export const emailTemplateMarkdown = `
<table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td align="center">
      <img src="https://res.cloudinary.com/dsll3ms2c/image/upload/c_thumb,w_200,dpr_auto,g_face/v1739141056/tcuplogo212_tgrmdm.png" 
           alt="TCUP Logo" 
           style="max-width:100px; height:auto; display:block;">
    </td>
  </tr>
</table>

Hello _____,

I'm writing to advance our upcoming show at ***VENUE*** on ***DATE***. Please forward or add any relevant parties onto this advance whose contact I might not have had. Please respond to all questions in red.

**Performance Agreement**
- Set Length
- Payment method and expected date of payment?
- Please provide the complete guarantee/split offer - so that we can have a record of our contract through this email.
- Ticket prices 
- Attendance estimates are not guaranteed

**Performer Info**
- Performer Email:
- DOS #:
- Number of members in performance/touring party:
  - Performer + touring party names/pronouns 
  - Note touring party members under 21/18
- Number of cars and car info
- Preferred soundcheck time/length (or open to fitting DOS schedule)
- Gear Sharing for the performance
- Preferred method of payment and DOS contact for payment


**Attachments**
- Stage Plot (if applicable)
- W9 (if applicable)

**Some questions for you:**
- Can you please send the DOS schedule?
  - Is there a curfew/hard cutoff?
- Who is the best DOS contact? Name and phone
- What, if any, security measures will be in place?
- Do you have stage specs/tech pack and loading/parking instructions you can send to us?
- What is the venue's WIFI login / password? 
- Who will be our DOS sound technician?
- Will the performer have a green room? 
  - If so, where in the building?
  - Is there a private bathroom?
  - Is the Wifi login the same?
- What accommodations does the venue have for accessibility? 
  - Is the venue ADA-accessible? 
  -  If not, what are some notices we should put out for accessibility?
  - Does the stage have ramp access?
- What is our guest list and hospitality package for the night?
- Are there any age restrictions at this venue?
- Merch Commission/Tax: is there any? If so, amounts?
- Merch Area: where shall the performer set-up their merchandise upon arrival?

Thanks so much and I'm looking forward to working with you!
`;

export const htmlContent = marked(emailTemplateMarkdown);