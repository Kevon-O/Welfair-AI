from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from textwrap import wrap

PAGE_WIDTH = 612
PAGE_HEIGHT = 792
MARGIN = 54
CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)


@dataclass(frozen=True)
class PdfSample:
    slug: str
    company: str
    company_meta: str
    title: str
    subtitle: str
    left_meta: tuple[tuple[str, str], ...]
    right_meta: tuple[tuple[str, str], ...]
    body_heading: str
    body_paragraphs: tuple[str, ...]
    action_heading: str
    action_lines: tuple[str, ...]
    contact_heading: str
    contact_lines: tuple[str, ...]
    header_fill: str
    panel_fill: str
    accent_stroke: str
    action_fill: str
    action_text: str


SAMPLES: tuple[PdfSample, ...] = (
    PdfSample(
        slug="fictional-eviction-notice",
        company="Linden Property Group",
        company_meta=(
            "1482 Linden Street, Newark, NJ 07102  |  (973) 555-0142  |  "
            "leasing@lindenproperty.example"
        ),
        title="THREE-DAY NOTICE TO PAY RENT OR QUIT",
        subtitle="Important housing notice regarding past-due rent and possible eviction filing",
        left_meta=(
            ("Date", "April 19, 2026"),
            ("Tenant", "Jordan Ellis"),
            ("Unit", "Apt 3B"),
        ),
        right_meta=(
            ("Amount Due", "$1,275.00"),
            ("Deadline", "April 26, 2026, 5:00 PM"),
            ("Notice Type", "Nonpayment cure notice"),
        ),
        body_heading="Summary of Notice",
        body_paragraphs=(
            "Our records show that rent for the period of April 1, 2026 through April 30, "
            "2026 has not been paid in full. The total amount currently due is $1,275.00.",
            "You are required to pay the full amount listed in this notice by April 26, 2026 "
            "to cure the nonpayment and remain in the property.",
            "If the balance is not resolved by the deadline, the landlord may move forward "
            "with filing an eviction case in court. That can create housing instability, a "
            "court record, and added difficulty securing future housing.",
        ),
        action_heading="Required Action",
        action_lines=(
            "Pay the full amount due or contact the leasing office before April 26, 2026 at 5:00 PM.",
            "Ask for any payment agreement in writing if the landlord offers one.",
        ),
        contact_heading="Contact Information",
        contact_lines=(
            "Leasing Office",
            "Certified funds accepted Monday through Friday, 9:00 AM to 5:00 PM.",
            "Questions: leasing@lindenproperty.example  |  (973) 555-0142",
        ),
        header_fill="#4c1d95",
        panel_fill="#f5f3ff",
        accent_stroke="#7c3aed",
        action_fill="#fef2f2",
        action_text="#991b1b",
    ),
    PdfSample(
        slug="fictional-utility-shutoff-final-notice",
        company="Metro Utilities Service",
        company_meta=(
            "240 Riverfront Plaza, Camden, NJ 08102  |  (856) 555-0191  |  "
            "support@metrous.example"
        ),
        title="FINAL NOTICE OF ELECTRIC SERVICE SHUTOFF",
        subtitle="Immediate action is required to avoid loss of utility service",
        left_meta=(
            ("Date", "April 19, 2026"),
            ("Customer", "Jordan Ellis"),
            ("Account No.", "MU-2048-7731"),
        ),
        right_meta=(
            ("Past Due", "$384.16"),
            ("Shutoff Date", "April 21, 2026"),
            ("Service Address", "1482 Linden Street, Apt 3B"),
        ),
        body_heading="Urgent Service Warning",
        body_paragraphs=(
            "This is a final notice that your electric account is seriously past due. Unless "
            "the full balance is paid or a payment arrangement is approved, electric service "
            "is scheduled for disconnection on April 21, 2026.",
            "Loss of electric service may affect refrigeration, lighting, medical devices, "
            "and the ability to safely remain in the home. Reconnection fees may apply after "
            "shutoff occurs.",
            "If you believe you qualify for hardship protection, medical certification, or "
            "utility assistance, contact customer support immediately and be prepared to "
            "provide supporting documents.",
        ),
        action_heading="Required Action Within 48 Hours",
        action_lines=(
            "Pay $384.16 in full or arrange approved hardship protection before April 21, 2026.",
            "If someone in the home depends on medical equipment, request emergency protection immediately.",
        ),
        contact_heading="Contact Information",
        contact_lines=(
            "Disconnection Prevention Team",
            "Call (856) 555-0191 and reference account MU-2048-7731.",
            "Emergency support: hardship@metrous.example  |  Office hours 7:00 AM to 8:00 PM",
        ),
        header_fill="#991b1b",
        panel_fill="#fff7ed",
        accent_stroke="#dc2626",
        action_fill="#7f1d1d",
        action_text="#ffffff",
    ),
    PdfSample(
        slug="fictional-medical-bill-statement",
        company="Northfield Community Health",
        company_meta=(
            "88 Garden Avenue, Trenton, NJ 08608  |  (609) 555-0135  |  "
            "billing@northfieldhealth.example"
        ),
        title="PATIENT BILLING STATEMENT",
        subtitle="Informational account summary with payment and assistance options",
        left_meta=(
            ("Statement Date", "April 19, 2026"),
            ("Patient", "Jordan Ellis"),
            ("Account No.", "NCH-994103"),
        ),
        right_meta=(
            ("Balance", "$82.40"),
            ("Due Date", "June 19, 2026"),
            ("Service Date", "April 7, 2026"),
        ),
        body_heading="Account Summary",
        body_paragraphs=(
            "This statement reflects a remaining patient balance of $82.40 after insurance "
            "processing for an outpatient visit on April 7, 2026.",
            "This is a routine billing statement, not a collections notice. No immediate "
            "enforcement action, service interruption, or account referral is listed in "
            "this statement.",
            "If any charges look incorrect, contact the billing office and ask for an "
            "itemized statement or insurance review. Payment plans and financial assistance "
            "may be available before the June 19, 2026 due date.",
        ),
        action_heading="Next Suggested Step",
        action_lines=(
            "Review the charges and pay or request a payment plan by June 19, 2026.",
            "Keep the statement and any insurance explanation of benefits for your records.",
        ),
        contact_heading="Contact Information",
        contact_lines=(
            "Patient Billing Office",
            "Call (609) 555-0135 for itemized billing questions or payment plan requests.",
            "Email billing@northfieldhealth.example  |  Financial assistance available upon request",
        ),
        header_fill="#1d4ed8",
        panel_fill="#eff6ff",
        accent_stroke="#2563eb",
        action_fill="#ecfdf5",
        action_text="#166534",
    ),
    PdfSample(
        slug="fictional-financial-aid-verification-notice-medium-severity",
        company="Garden State University Financial Aid Office",
        company_meta=(
            "410 College Avenue, Newark, NJ 07104  |  (973) 555-0164  |  "
            "finaid@gstateu.example"
        ),
        title="FINANCIAL AID VERIFICATION REQUEST",
        subtitle="Additional documents are needed to keep federal and institutional aid on track",
        left_meta=(
            ("Date", "April 19, 2026"),
            ("Student", "Jordan Ellis"),
            ("Student ID", "GSU-441928"),
        ),
        right_meta=(
            ("Requested By", "May 12, 2026"),
            ("Award Year", "2026-2027"),
            ("Status", "Pending verification"),
        ),
        body_heading="Notice Summary",
        body_paragraphs=(
            "Your financial aid application has been selected for routine verification. "
            "Before aid can be finalized, the Financial Aid Office must receive copies of "
            "the requested documents listed below.",
            "The missing items are a signed household size statement, a 2024 tax return or "
            "tax transcript, and proof of identity. If the documents are not received by "
            "May 12, 2026, your grant and loan disbursement may be delayed.",
            "This notice does not cancel your aid today, but it does require follow-up "
            "within the next few weeks so your tuition balance and enrollment plans stay on track.",
        ),
        action_heading="Documents Requested",
        action_lines=(
            "Submit the verification worksheet, tax documents, and ID by May 12, 2026.",
            "If you cannot obtain an item right away, contact the office soon to ask about alternatives.",
        ),
        contact_heading="Contact Information",
        contact_lines=(
            "Verification Processing Team",
            "Upload documents through the student portal or visit the Financial Aid Office in person.",
            "Questions: finaid@gstateu.example  |  (973) 555-0164  |  Office hours 8:30 AM to 5:00 PM",
        ),
        header_fill="#1e3a8a",
        panel_fill="#eff6ff",
        accent_stroke="#2563eb",
        action_fill="#fffbeb",
        action_text="#92400e",
    ),
    PdfSample(
        slug="fictional-medical-billing-account-follow-up",
        company="Northfield Community Health",
        company_meta=(
            "88 Garden Avenue, Trenton, NJ 08608  |  (609) 555-0135  |  "
            "billing@northfieldhealth.example"
        ),
        title="PATIENT BILLING ACCOUNT FOLLOW-UP",
        subtitle="Updated insurance, payment, and financial assistance information",
        left_meta=(
            ("Date", "April 19, 2026"),
            ("Patient", "Jordan Ellis"),
            ("Account No.", "NCH-994103"),
        ),
        right_meta=(
            ("Current Balance", "$82.40"),
            ("Statement Due", "June 19, 2026"),
            ("Status", "Payment review requested"),
        ),
        body_heading="Account Update",
        body_paragraphs=(
            "The patient reviewed the charges listed on the April 19, 2026 billing statement "
            "and believes the visit charge and facility fee are correct.",
            "An insurance explanation of benefits was received on April 18, 2026 from Garden "
            "Shield Health Plan. The explanation shows patient responsibility in the amount "
            "of $82.40 after insurance processing.",
            "The patient cannot afford the full balance in one payment and is requesting a "
            "monthly payment plan. The patient states an affordable amount would be $20.60 "
            "per month over four months.",
            "A financial assistance screening was completed on April 19, 2026. Based on the "
            "information currently on file, the patient does not appear to qualify for the "
            "available charity-care discount.",
        ),
        action_heading="Requested Billing Follow-Up",
        action_lines=(
            "Review the account for payment-plan setup before the June 19, 2026 due date.",
            "Contact the patient if any additional billing or insurance documents are needed.",
        ),
        contact_heading="Contact Information",
        contact_lines=(
            "Patient Billing Office",
            "Phone: (609) 555-0135  |  Email: billing@northfieldhealth.example",
            "Preferred contact time: weekdays after 3:00 PM",
        ),
        header_fill="#0f766e",
        panel_fill="#f0fdfa",
        accent_stroke="#0d9488",
        action_fill="#ecfeff",
        action_text="#155e75",
    ),
)


def hex_to_rgb(value: str) -> tuple[float, float, float]:
    value = value.lstrip("#")
    return tuple(int(value[index : index + 2], 16) / 255 for index in (0, 2, 4))


def escape_pdf_text(value: str) -> str:
    return value.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


class PdfCanvas:
    def __init__(self) -> None:
        self.ops: list[str] = []

    def fill_rect(self, x: float, y: float, width: float, height: float, color: str) -> None:
        r, g, b = hex_to_rgb(color)
        self.ops.extend(
            [
                f"{r:.4f} {g:.4f} {b:.4f} rg",
                f"{x:.2f} {y:.2f} {width:.2f} {height:.2f} re f",
            ]
        )

    def stroke_rect(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        color: str,
        line_width: float = 1.5,
    ) -> None:
        r, g, b = hex_to_rgb(color)
        self.ops.extend(
            [
                f"{r:.4f} {g:.4f} {b:.4f} RG",
                f"{line_width:.2f} w",
                f"{x:.2f} {y:.2f} {width:.2f} {height:.2f} re S",
            ]
        )

    def text(self, x: float, y: float, value: str, font: str, size: int, color: str) -> None:
        r, g, b = hex_to_rgb(color)
        self.ops.extend(
            [
                "BT",
                f"{r:.4f} {g:.4f} {b:.4f} rg",
                f"/{font} {size} Tf",
                f"1 0 0 1 {x:.2f} {y:.2f} Tm",
                f"({escape_pdf_text(value)}) Tj",
                "ET",
            ]
        )

    def build(self) -> bytes:
        return "\n".join(self.ops).encode("latin-1", errors="replace")


def wrap_paragraphs(paragraphs: tuple[str, ...], width: int) -> list[list[str]]:
    return [wrap(paragraph, width=width) for paragraph in paragraphs]


def write_line_block(
    canvas: PdfCanvas,
    x: float,
    top_y: float,
    lines: list[str],
    *,
    font: str,
    size: int,
    color: str,
    line_height: float,
) -> float:
    cursor = top_y
    for line in lines:
        canvas.text(x, cursor - size, line, font=font, size=size, color=color)
        cursor -= line_height
    return cursor


def draw_meta_box(
    canvas: PdfCanvas,
    x: float,
    top_y: float,
    width: float,
    height: float,
    items: tuple[tuple[str, str], ...],
) -> None:
    canvas.stroke_rect(x, top_y - height, width, height, color="#dbe2ea", line_width=1.25)
    row_top = top_y - 18
    for label, value in items:
        canvas.text(x + 16, row_top - 9, label.upper(), font="F2", size=8, color="#64748b")
        wrapped_value = wrap(value, width=28)[:2]
        value_top = row_top - 16
        for index, line in enumerate(wrapped_value):
            canvas.text(
                x + 16,
                value_top - (index * 12),
                line,
                font="F1",
                size=10,
                color="#0f172a",
            )
        row_top -= 28


def render_pdf(sample: PdfSample, output_path: Path) -> None:
    canvas = PdfCanvas()
    outer_x = 40
    outer_y = 40
    outer_width = PAGE_WIDTH - (outer_x * 2)
    outer_height = PAGE_HEIGHT - (outer_y * 2)
    canvas.stroke_rect(outer_x, outer_y, outer_width, outer_height, color="#d4d4d8", line_width=1.5)

    cursor_top = PAGE_HEIGHT - MARGIN

    header_height = 88
    canvas.fill_rect(MARGIN, cursor_top - header_height, CONTENT_WIDTH, header_height, sample.header_fill)
    cursor = cursor_top - 24
    company_lines = wrap(sample.company, width=36)
    cursor = write_line_block(
        canvas,
        MARGIN + 20,
        cursor,
        company_lines,
        font="F2",
        size=18,
        color="#ffffff",
        line_height=22,
    )
    meta_lines = wrap(sample.company_meta, width=80)
    write_line_block(
        canvas,
        MARGIN + 20,
        cursor - 6,
        meta_lines,
        font="F1",
        size=9,
        color="#ffffff",
        line_height=12,
    )
    cursor_top -= header_height + 16

    title_height = 70
    canvas.fill_rect(MARGIN, cursor_top - title_height, CONTENT_WIDTH, title_height, sample.panel_fill)
    canvas.stroke_rect(MARGIN, cursor_top - title_height, CONTENT_WIDTH, title_height, sample.accent_stroke, line_width=2.0)
    title_lines = wrap(sample.title, width=48)
    title_cursor = cursor_top - 20
    title_cursor = write_line_block(
        canvas,
        MARGIN + 20,
        title_cursor,
        title_lines,
        font="F2",
        size=15,
        color="#111827",
        line_height=18,
    )
    subtitle_lines = wrap(sample.subtitle, width=78)
    write_line_block(
        canvas,
        MARGIN + 20,
        title_cursor - 2,
        subtitle_lines,
        font="F1",
        size=9,
        color="#475569",
        line_height=11,
    )
    cursor_top -= title_height + 16

    meta_height = 88
    meta_gap = 20
    meta_width = (CONTENT_WIDTH - meta_gap) / 2
    draw_meta_box(canvas, MARGIN, cursor_top, meta_width, meta_height, sample.left_meta)
    draw_meta_box(canvas, MARGIN + meta_width + meta_gap, cursor_top, meta_width, meta_height, sample.right_meta)
    cursor_top -= meta_height + 18

    body_lines = wrap_paragraphs(sample.body_paragraphs, width=86)
    body_line_count = sum(len(lines) for lines in body_lines)
    body_height = 54 + (body_line_count * 13) + ((len(body_lines) - 1) * 10)
    canvas.stroke_rect(MARGIN, cursor_top - body_height, CONTENT_WIDTH, body_height, color="#dbe2ea", line_width=1.25)
    body_cursor = cursor_top - 18
    body_cursor = write_line_block(
        canvas,
        MARGIN + 20,
        body_cursor,
        [sample.body_heading],
        font="F2",
        size=11,
        color="#0f172a",
        line_height=14,
    )
    body_cursor -= 8
    for paragraph_lines in body_lines:
        body_cursor = write_line_block(
            canvas,
            MARGIN + 20,
            body_cursor,
            paragraph_lines,
            font="F1",
            size=10,
            color="#334155",
            line_height=13,
        )
        body_cursor -= 10
    cursor_top -= body_height + 18

    action_lines = [sample.action_heading, *sample.action_lines]
    action_line_height = 14
    action_height = 26 + (len(action_lines) * action_line_height) + 14
    canvas.fill_rect(MARGIN, cursor_top - action_height, CONTENT_WIDTH, action_height, sample.action_fill)
    action_cursor = cursor_top - 18
    action_cursor = write_line_block(
        canvas,
        MARGIN + 20,
        action_cursor,
        [sample.action_heading],
        font="F2",
        size=11,
        color=sample.action_text,
        line_height=14,
    )
    write_line_block(
        canvas,
        MARGIN + 20,
        action_cursor - 2,
        list(sample.action_lines),
        font="F1",
        size=10,
        color=sample.action_text,
        line_height=13,
    )
    cursor_top -= action_height + 18

    contact_height = 82
    canvas.fill_rect(MARGIN, cursor_top - contact_height, CONTENT_WIDTH, contact_height, sample.panel_fill)
    canvas.stroke_rect(MARGIN, cursor_top - contact_height, CONTENT_WIDTH, contact_height, color="#dbe2ea", line_width=1.25)
    contact_cursor = cursor_top - 18
    contact_cursor = write_line_block(
        canvas,
        MARGIN + 20,
        contact_cursor,
        [sample.contact_heading],
        font="F2",
        size=11,
        color="#111827",
        line_height=14,
    )
    write_line_block(
        canvas,
        MARGIN + 20,
        contact_cursor - 2,
        list(sample.contact_lines),
        font="F1",
        size=10,
        color="#334155",
        line_height=12,
    )

    footer_text = "This document is fully fictional and created only for Welfair AI product testing."
    canvas.text(MARGIN, 58, footer_text, font="F1", size=8, color="#64748b")

    content_stream = canvas.build()
    objects = [
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
        b"2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n",
        (
            b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            b"/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n"
        ),
        b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
        f"6 0 obj\n<< /Length {len(content_stream)} >>\nstream\n".encode("latin-1")
        + content_stream
        + b"\nendstream\nendobj\n",
    ]

    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for obj in objects:
        offsets.append(len(pdf))
        pdf.extend(obj)

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))

    trailer = f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_start}\n%%EOF\n"
    pdf.extend(trailer.encode("latin-1"))
    output_path.write_bytes(pdf)


def main() -> None:
    output_dir = Path(__file__).resolve().parent
    for sample in SAMPLES:
        render_pdf(sample, output_dir / f"{sample.slug}.pdf")


if __name__ == "__main__":
    main()
