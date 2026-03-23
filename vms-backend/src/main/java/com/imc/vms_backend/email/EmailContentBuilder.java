package com.imc.vms_backend.email;

public class EmailContentBuilder {
        public static String buildSubject(EmailType type) {
                return switch (type) {
                        case VENDOR_APPROVED -> "IMC Vendor Registration Approved";
                        case VENDOR_CREDENTIALS_RESET -> "IMC Password Reset Link";
                        case VENDOR_REJECTED -> "IMC Vendor Registration Rejected";
                        case INVOICE_CREATOR_APPROVED -> "IMC Invoice Update – Approved by Creator";
                        case INVOICE_VERIFIER_APPROVED -> "IMC Invoice Update – Verified";
                        case INVOICE_REJECTED -> "IMC Invoice Rejected – Action Required";
                        case INVOICE_APPROVED -> "IMC Invoice Approved – Ready for Payment";
                        case INVOICE_PAID -> "IMC Invoice Paid";
                };
        }

        public static String buildBody(
                        EmailType type,
                        String vendorName,
                        String extraInfo) {

                String safeVendorName = (vendorName == null || vendorName.isBlank()) ? "Vendor" : vendorName;
                String extra = (extraInfo == null) ? "" : extraInfo.trim();
                String extraLine = extra.isBlank() ? "" : extra;

                return switch (type) {
                        case VENDOR_APPROVED -> {
                                yield """
                                                Dear %s,

                                                Your vendor registration with Indore Municipal Corporation
                                                has been approved.

                                                To activate your account, set your password using this link:
                                                %s

                                                Regards,
                                                IMC Vendor Management System
                                                (This is an auto-generated email. Do not reply.)
                                                """.formatted(
                                                safeVendorName,
                                                extra.isBlank() ? "(link unavailable — please contact support)"
                                                                : extra);
                        }

                        case VENDOR_CREDENTIALS_RESET -> {
                                yield """
                                                Dear %s,

                                                A password reset was requested for your IMC Vendor Management System account.

                                                Set a new password using this link:
                                                %s

                                                Regards,
                                                IMC Vendor Management System
                                                (This is an auto-generated email. Do not reply.)
                                                """
                                                .formatted(
                                                                safeVendorName,
                                                                extra.isBlank() ? "(link unavailable — please contact support)"
                                                                                : extra);
                        }

                        case INVOICE_CREATOR_APPROVED -> """
                                        Dear %s,

                                        Your invoice has been approved by the Creator and moved to the next stage.
                                        %s

                                        Regards,
                                        IMC Vendor Management System
                                        """.formatted(safeVendorName, extraLine);

                        case INVOICE_VERIFIER_APPROVED -> """
                                        Dear %s,

                                        Your invoice has been verified and moved to the next stage.
                                        %s

                                        Regards,
                                        IMC Vendor Management System
                                        """.formatted(safeVendorName, extraLine);

                        case VENDOR_REJECTED -> """
                                        Dear %s,

                                        Your vendor registration request has been rejected
                                        after verification.

                                        You may re-apply with correct information.

                                        Regards,
                                        IMC Vendor Management System
                                        """.formatted(safeVendorName);

                        case INVOICE_REJECTED -> """
                                        Dear %s,

                                        Your invoice has been rejected.

                                        Remarks:
                                        %s

                                        Please login to the portal and take necessary action.

                                        Regards,
                                        IMC Vendor Management System
                                        """.formatted(safeVendorName, extraInfo == null ? "" : extraInfo);

                        case INVOICE_APPROVED -> """
                                        Dear %s,

                                        Your invoice has been approved and is ready
                                        for payment processing.

                                        %s

                                        Regards,
                                        IMC Vendor Management System
                                        """.formatted(safeVendorName, extraLine);

                        case INVOICE_PAID -> """
                                        Dear %s,

                                        Your invoice has been marked as paid.

                                        %s

                                        Regards,
                                        IMC Vendor Management System
                                        """.formatted(safeVendorName, extraLine);
                };
        }
}
