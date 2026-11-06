
import { Resend } from "resend";
import { contactMessageSchema } from "@/lib/portfolio-schemas";
import {
  getCollection,
  COLLECTIONS,
} from "@/lib/portfolio-collections";

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request) {
  try {
    // 1. Basic request-size check
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > 20_000) {
      return jsonResponse(
        { success: false, message: "Request is too large." },
        413
      );
    }

    // 2. Read and validate data
    const body = await request.json();
    const validation = contactMessageSchema.safeParse(body);

    if (!validation.success) {
      return jsonResponse(
        {
          success: false,
          message:
            validation.error.issues[0]?.message ||
            "Please provide valid contact information.",
        },
        400
      );
    }

    const { name, email, subject, message, website } = validation.data;

    // 3. Honeypot: silently accept bot submissions without saving
    if (website) {
      return jsonResponse({
        success: true,
        message: "Your message has been received.",
      });
    }

    // 4. Save the message first, so email failure doesn't lose it
    const collection = await getCollection(
      COLLECTIONS.CONTACT_MESSAGES
    );

    const now = new Date();

    const savedMessage = {
      name,
      email,
      subject,
      message,
      status: "unread",
      notificationSent: false,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(savedMessage);

    // 5. Send email notification when configured
    let notificationSent = false;

    const apiKey = process.env.RESEND_API_KEY;
    const receiver = process.env.CONTACT_RECEIVER_EMAIL;
    const sender = process.env.CONTACT_FROM_EMAIL;

    if (apiKey && receiver && sender) {
      try {
        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
          from: sender,
          to: [receiver],
          replyTo: email,
          subject: `Portfolio Contact: ${subject}`,
          text: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Subject: ${subject}`,
            "",
            "Message:",
            message,
          ].join("\n"),
        });

        if (error) {
          console.error("Resend email error:", error);
        } else {
          notificationSent = true;

          await collection.updateOne(
            { _id: result.insertedId },
            {
              $set: {
                notificationSent: true,
                emailMessageId: data?.id || null,
                updatedAt: new Date(),
              },
            }
          );
        }
      } catch (emailError) {
        // The contact message is already stored in MongoDB.
        console.error("Email notification error:", emailError);
      }
    } else {
      console.warn(
        "Contact message saved, but email notification is not configured."
      );
    }

    return jsonResponse(
      {
        success: true,
        message: "Your message has been sent successfully.",
        notificationSent,
      },
      201
    );
  } catch (error) {
    console.error("Contact API error:", error);

    return jsonResponse(
      {
        success: false,
        message: "Unable to send your message. Please try again.",
      },
      500
    );
  }
}
