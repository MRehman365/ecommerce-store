import nodemailer from "nodemailer";

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function getTransport() {
  if (!isEmailConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transport = await getTransport();
  if (!transport) {
    console.info("[email skipped — SMTP not configured]", options.subject, options.to);
    return { skipped: true as const };
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { skipped: false as const };
}

export async function notifyOrderCreated(order: {
  orderNumber: string;
  customer: { fullName: string; email?: string; phone: string };
  total: number;
  paymentMethod: string;
}) {
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
  if (adminTo) {
    await sendEmail({
      to: adminTo,
      subject: `New order ${order.orderNumber}`,
      html: `<p>New order <strong>${order.orderNumber}</strong> from ${order.customer.fullName} (${order.customer.phone}).</p><p>Total: ${order.total} · ${order.paymentMethod}</p>`,
    });
  }

  if (order.customer.email) {
    await sendEmail({
      to: order.customer.email,
      subject: `Order confirmation ${order.orderNumber}`,
      html: `<p>Thanks ${order.customer.fullName}! Your order <strong>${order.orderNumber}</strong> is confirmed.</p><p>Total: ${order.total}. Payment: ${order.paymentMethod}.</p>`,
    });
  }
}

export async function notifyOrderStatus(order: {
  orderNumber: string;
  customer: { email?: string; fullName: string };
  orderStatus: string;
  paymentStatus: string;
}) {
  if (!order.customer.email) return;
  await sendEmail({
    to: order.customer.email,
    subject: `Order ${order.orderNumber} update`,
    html: `<p>Hi ${order.customer.fullName}, your order is now <strong>${order.orderStatus}</strong> (payment: ${order.paymentStatus}).</p>`,
  });
}
