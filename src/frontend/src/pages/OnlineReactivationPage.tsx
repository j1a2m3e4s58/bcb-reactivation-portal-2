import { ExternalBlob } from "@/backend";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitOnlineReactivation } from "@/lib/backend";
import { useSearch } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileImage,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/gif,image/webp,image/bmp,.heic,.jfif";

interface FormValues {
  fullName: string;
  phoneNumber: string;
  accountNumber: string;
  extraInfo: string;
}

interface ImageField {
  file: File | null;
  previewUrl: string;
}

const EMPTY_IMAGE: ImageField = { file: null, previewUrl: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      className="flex items-center gap-1.5 text-sm text-destructive mt-1"
      role="alert"
      data-ocid="form.field_error"
    >
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      {message}
    </p>
  );
}

function ImageUploadCard({
  label,
  required,
  field,
  onSelect,
  onClear,
  onPreview,
  ocidPrefix,
  disabled,
}: {
  label: string;
  required?: boolean;
  field: ImageField;
  onSelect: (file: File) => void;
  onClear: () => void;
  onPreview: () => void;
  ocidPrefix: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onSelect(file);
    e.target.value = "";
  }

  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4">
      <p className="text-sm font-medium text-foreground mb-3">
        {label} {required && <span className="text-destructive">*</span>}
      </p>

      {field.file ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-14 h-14 rounded-lg border border-border overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:opacity-80 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary p-0"
            onClick={onPreview}
            aria-label={`Preview ${label}`}
            data-ocid={`${ocidPrefix}.preview_button`}
          >
            <img
              src={field.previewUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium truncate">
              {field.file.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(field.file.size / 1024).toFixed(0)} KB
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onPreview}
              disabled={disabled}
              aria-label={`Preview ${label}`}
              data-ocid={`${ocidPrefix}.view_button`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              disabled={disabled}
              aria-label={`Remove ${label}`}
              data-ocid={`${ocidPrefix}.clear_button`}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="w-full flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          data-ocid={`${ocidPrefix}.upload_button`}
          aria-label={`Upload ${label}`}
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <FileImage className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <span className="text-sm text-muted-foreground">
            Click to upload{" "}
            <span className="text-primary font-medium">image</span>
          </span>
          <span className="text-xs text-muted-foreground/70">
            PNG, JPG, WEBP, GIF, BMP, HEIC
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleChange}
        className="sr-only"
        aria-label={`File input for ${label}`}
        disabled={disabled}
      />
    </div>
  );
}

interface SuccessData {
  fullName: string;
  phoneNumber: string;
  accountNumber: string;
}

function SuccessOverlay({
  data,
  onReset,
}: { data: SuccessData; onReset: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 text-center"
      data-ocid="reactivation_form.success_state"
    >
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-5">
        <CheckCircle2 className="w-9 h-9 text-success" aria-hidden="true" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground">
        Reactivation Request Submitted!
      </h2>
      <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
        Your online reactivation request has been received successfully. Our
        team will review your documents and contact you shortly.
      </p>

      <div className="mt-6 bg-card border border-border rounded-xl p-5 text-left w-full max-w-sm shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Submission Summary
        </p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Full Name</dt>
            <dd className="font-medium text-foreground text-right">
              {data.fullName}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="font-medium text-foreground">{data.phoneNumber}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Account Number</dt>
            <dd className="font-medium text-foreground font-mono text-xs">
              {data.accountNumber}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Documents</dt>
            <dd className="text-success font-medium">3 images uploaded</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link to="/">
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </Button>
        </Link>
        <Button
          onClick={onReset}
          className="w-full sm:w-auto"
          data-ocid="reactivation_form.submit_another_button"
        >
          Submit Another Request
        </Button>
      </div>
    </div>
  );
}

export default function OnlineReactivationPage() {
  // Read prefilled query params
  const searchParams = useSearch({ strict: false }) as Record<
    string,
    string | undefined
  >;
  const prefillAccount = searchParams.account ?? "";
  const prefillName = searchParams.name ?? "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fullName: prefillName,
      phoneNumber: "",
      accountNumber: prefillAccount,
      extraInfo: "",
    },
  });

  const submitMutation = useSubmitOnlineReactivation();

  const [frontImage, setFrontImage] = useState<ImageField>(EMPTY_IMAGE);
  const [backImage, setBackImage] = useState<ImageField>(EMPTY_IMAGE);
  const [selfieImage, setSelfieImage] = useState<ImageField>(EMPTY_IMAGE);
  const [imageErrors, setImageErrors] = useState({
    front: "",
    back: "",
    selfie: "",
  });
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    src: string;
    title: string;
  }>({
    open: false,
    src: "",
    title: "",
  });
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setImage(
    setter: React.Dispatch<React.SetStateAction<ImageField>>,
    errorKey: keyof typeof imageErrors,
  ) {
    return (file: File) => {
      const url = URL.createObjectURL(file);
      setter({ file, previewUrl: url });
      setImageErrors((prev) => ({ ...prev, [errorKey]: "" }));
    };
  }

  function clearImage(
    setter: React.Dispatch<React.SetStateAction<ImageField>>,
    current: ImageField,
  ) {
    return () => {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      setter(EMPTY_IMAGE);
    };
  }

  function openPreview(src: string, title: string) {
    setPreviewModal({ open: true, src, title });
  }

  function validateImages() {
    const errs = { front: "", back: "", selfie: "" };
    if (!frontImage.file) errs.front = "Ghana Card front image is required.";
    if (!backImage.file) errs.back = "Ghana Card back image is required.";
    if (!selfieImage.file) errs.selfie = "Selfie with Ghana Card is required.";
    setImageErrors(errs);
    return !errs.front && !errs.back && !errs.selfie;
  }

  async function onSubmit(values: FormValues) {
    if (!validateImages()) return;
    setIsSubmitting(true);

    try {
      const readFileAsBytes = async (
        file: File,
      ): Promise<Uint8Array<ArrayBuffer>> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(
              new Uint8Array(
                reader.result as ArrayBuffer,
              ) as Uint8Array<ArrayBuffer>,
            );
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsArrayBuffer(file);
        });
      };

      const [frontBytes, backBytes, selfieBytes] = await Promise.all([
        readFileAsBytes(frontImage.file!),
        readFileAsBytes(backImage.file!),
        readFileAsBytes(selfieImage.file!),
      ]);

      const frontBlob = ExternalBlob.fromBytes(frontBytes);
      const backBlob = ExternalBlob.fromBytes(backBytes);
      const selfieBlob = ExternalBlob.fromBytes(selfieBytes);

      const result = await submitMutation.mutateAsync({
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        accountNumber: values.accountNumber.trim(),
        extraInfo: values.extraInfo.trim() || null,
        ghanaCardFrontKey: frontBlob,
        ghanaCardBackKey: backBlob,
        ghanaCardSelfieKey: selfieBlob,
      });

      if (result.__kind__ === "err") {
        toast.error(result.err);
        return;
      }

      setSuccessData({
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        accountNumber: values.accountNumber.trim(),
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Submission failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    reset({ fullName: "", phoneNumber: "", accountNumber: "", extraInfo: "" });
    if (frontImage.previewUrl) URL.revokeObjectURL(frontImage.previewUrl);
    if (backImage.previewUrl) URL.revokeObjectURL(backImage.previewUrl);
    if (selfieImage.previewUrl) URL.revokeObjectURL(selfieImage.previewUrl);
    setFrontImage(EMPTY_IMAGE);
    setBackImage(EMPTY_IMAGE);
    setSelfieImage(EMPTY_IMAGE);
    setImageErrors({ front: "", back: "", selfie: "" });
    setSuccessData(null);
    submitMutation.reset();
  }

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <Link
            to="/reactivation"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4"
            data-ocid="reactivation_form.back_link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reactivation Portal
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary/80 block">
            Online Application
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Online Reactivation Form
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
            Complete this form to submit your dormant account reactivation
            request online. You will need photos of your Ghana Card (front,
            back, and a selfie).
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successData ? (
          <SuccessOverlay data={successData} onReset={handleReset} />
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            data-ocid="reactivation_form.section"
          >
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm">
                <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full legal name"
                      {...register("fullName", {
                        required: "Full name is required.",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters.",
                        },
                      })}
                      data-ocid="reactivation_form.full_name_input"
                      disabled={isSubmitting}
                      aria-describedby={
                        errors.fullName ? "fullName-error" : undefined
                      }
                    />
                    {errors.fullName && (
                      <FieldError message={errors.fullName.message} />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phoneNumber"
                      className="text-sm font-medium"
                    >
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      placeholder="e.g. 0241234567"
                      maxLength={10}
                      {...register("phoneNumber", {
                        required: "Phone number is required.",
                        pattern: {
                          value: /^\d{10}$/,
                          message:
                            "Enter a valid 10-digit Ghana phone number (digits only).",
                        },
                        onChange: (e) => {
                          e.target.value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                        },
                      })}
                      data-ocid="reactivation_form.phone_input"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ghana number: exactly 10 digits
                    </p>
                    {errors.phoneNumber && (
                      <FieldError message={errors.phoneNumber.message} />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="accountNumber"
                      className="text-sm font-medium"
                    >
                      Account Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="accountNumber"
                      placeholder="Enter your account number"
                      {...register("accountNumber", {
                        required: "Account number is required.",
                      })}
                      data-ocid="reactivation_form.account_number_input"
                      disabled={isSubmitting}
                    />
                    {errors.accountNumber && (
                      <FieldError message={errors.accountNumber.message} />
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="extraInfo" className="text-sm font-medium">
                      Additional Information{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Textarea
                      id="extraInfo"
                      placeholder="Any additional details you'd like to share with the bank…"
                      rows={3}
                      {...register("extraInfo")}
                      data-ocid="reactivation_form.extra_info_textarea"
                      disabled={isSubmitting}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ghana Card Documents */}
              <div className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm">
                <h2 className="font-display font-semibold text-foreground mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  Ghana Card Documents
                </h2>
                <p className="text-sm text-muted-foreground mb-4 ml-8">
                  Upload clear photos of your Ghana National ID Card. All three
                  images are required.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <ImageUploadCard
                      label="Ghana Card — Front"
                      required
                      field={frontImage}
                      onSelect={setImage(setFrontImage, "front")}
                      onClear={clearImage(setFrontImage, frontImage)}
                      onPreview={() =>
                        openPreview(frontImage.previewUrl, "Ghana Card — Front")
                      }
                      ocidPrefix="reactivation_form.ghana_card_front"
                      disabled={isSubmitting}
                    />
                    {imageErrors.front && (
                      <FieldError message={imageErrors.front} />
                    )}
                  </div>
                  <div>
                    <ImageUploadCard
                      label="Ghana Card — Back"
                      required
                      field={backImage}
                      onSelect={setImage(setBackImage, "back")}
                      onClear={clearImage(setBackImage, backImage)}
                      onPreview={() =>
                        openPreview(backImage.previewUrl, "Ghana Card — Back")
                      }
                      ocidPrefix="reactivation_form.ghana_card_back"
                      disabled={isSubmitting}
                    />
                    {imageErrors.back && (
                      <FieldError message={imageErrors.back} />
                    )}
                  </div>
                  <div>
                    <ImageUploadCard
                      label="Selfie with Ghana Card"
                      required
                      field={selfieImage}
                      onSelect={setImage(setSelfieImage, "selfie")}
                      onClear={clearImage(setSelfieImage, selfieImage)}
                      onPreview={() =>
                        openPreview(
                          selfieImage.previewUrl,
                          "Selfie with Ghana Card",
                        )
                      }
                      ocidPrefix="reactivation_form.selfie"
                      disabled={isSubmitting}
                    />
                    {imageErrors.selfie && (
                      <FieldError message={imageErrors.selfie} />
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <p className="text-xs text-muted-foreground max-w-sm">
                  By submitting this form, you confirm that the information
                  provided is accurate and the documents are genuine.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto gap-2 min-w-[180px]"
                  data-ocid="reactivation_form.submit_button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading documents…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit Reactivation
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </section>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        open={previewModal.open}
        onOpenChange={(o) => setPreviewModal((p) => ({ ...p, open: o }))}
        src={previewModal.src}
        alt={previewModal.title}
        title={previewModal.title}
      />
    </PublicLayout>
  );
}
