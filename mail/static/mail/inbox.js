document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = send_email;
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Update the mailbox with the latest emails to show for this mailbox.
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        const sections_to_show = [['sender', 5], ['subject', 3], ['timestamp', 4]];
        const artificial_first_email = {'sender': 'Sender', 'subject': 'Subject', 'timestamp': 'Date and time',
            'read': true};
        emails = [artificial_first_email, ...emails];
        emails.forEach(email => {
            const row_div_element = document.createElement('div');
            row_div_element.classList.add("row","email-line-box", email["read"] ? "read" : "unread");
            if (email === artificial_first_email) {row_div_element.id = 'titled-first-row';}
            sections_to_show.forEach(
                section => {
                    const section_name = section[0];
                    const section_size = section[1];
                    const div_section = document.createElement('div');
                    div_section.classList.add(`col-${section_size}`, `${section_name}-section`);
                    div_section.innerHTML = `<p>${email[section_name]}</p>`;
                    row_div_element.append(div_section);

                            });
            document.querySelector('#emails-view').append(row_div_element);



        })

    })
      .catch(error => console.log(error)); // just in case!
}

function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
      .then(result => {
        if ("message" in result) {
            // The email was sent successfully!
            load_mailbox('sent');
        }

        if ("error" in result) {
            // There was an error in sending the email
            // Display the error next to the "To:"
            document.querySelector('#to-text-error-message').innerHTML = result['error']

        }
        console.log(result);
        console.log("message" in result);
        console.log("error" in result);
      })
        .catch(error => {
            // we hope this code is never executed, but who knows?
            console.log(error);
        });
  return false;
}


