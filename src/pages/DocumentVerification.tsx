import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, FileText } from 'lucide-react';
import { Card, Button, ConfidenceBadge } from '../components';
import styles from './DocumentVerification.module.css';

interface ExtractedField {
  id: string;
  fieldName: string;
  extractedValue: string;
  confidence: number;
  isEditing?: boolean;
}

const initialFields: ExtractedField[] = [
  { id: '1', fieldName: 'Petitioner 1', extractedValue: 'John A. Smith', confidence: 98 },
  { id: '2', fieldName: 'Tax ID Number 1', extractedValue: '123-45-6789', confidence: 100 },
  { id: '3', fieldName: 'Petitioner 2', extractedValue: 'Mary B. Smith', confidence: 85 },
  { id: '4', fieldName: 'Tax ID Number 2', extractedValue: '987-65-4321', confidence: 72 },
];

export function DocumentVerification() {
  const { id: _documentId } = useParams();
  const [fields, setFields] = useState<ExtractedField[]>(initialFields);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: ExtractedField) => {
    setEditingField(field.id);
    setEditValue(field.extractedValue);
  };

  const handleSave = (fieldId: string) => {
    setFields(fields.map(f =>
      f.id === fieldId ? { ...f, extractedValue: editValue } : f
    ));
    setEditingField(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link to="/document-queue" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Document Queue</span>
        </Link>
        <h1>Document Verification</h1>
        <p>Review and confirm the extracted information from the Statement of Taxpayer Identification</p>
      </div>

      <div className={styles.content}>
        <div className={styles.dataPanel}>
          <Card padding="lg">
            <div className={styles.panelHeader}>
              <h2>Extracted Data</h2>
              <p>Verify the accuracy of extracted information. Edit any incorrect values.</p>
            </div>

            <div className={styles.fieldsTable}>
              <div className={styles.tableHeader}>
                <span>Field Name</span>
                <span>Extracted Value</span>
                <span>Confidence</span>
                <span></span>
              </div>

              {fields.map((field) => (
                <div key={field.id} className={styles.tableRow}>
                  <span className={styles.fieldName}>{field.fieldName}</span>
                  <div className={styles.fieldValue}>
                    {editingField === field.id ? (
                      <div className={styles.editGroup}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className={styles.editInput}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleSave(field.id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span>{field.extractedValue}</span>
                    )}
                  </div>
                  <div className={styles.fieldConfidence}>
                    <ConfidenceBadge value={field.confidence} />
                  </div>
                  <div className={styles.fieldAction}>
                    {editingField !== field.id && (
                      <button
                        className={styles.editButton}
                        onClick={() => handleEdit(field)}
                        aria-label="Edit field"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.confidenceLegend}>
              <span className={styles.legendTitle}>Confidence Levels:</span>
              <div className={styles.legendItems}>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.high}`}></span>
                  <span>High (&ge;95%)</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.medium}`}></span>
                  <span>Medium (80-94%)</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.low}`}></span>
                  <span>Low (&lt;80%)</span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="lg" icon={<Check size={20} />}>
                Approve & Continue
              </Button>
              <Button variant="secondary" size="lg">
                Reject
              </Button>
            </div>
          </Card>
        </div>

        <div className={styles.previewPanel}>
          <Card padding="lg">
            <div className={styles.panelHeader}>
              <h2>Document Preview</h2>
              <p>Statement of Taxpayer Identification Number</p>
            </div>

            <div className={styles.documentPreview}>
              <div className={styles.documentFrame}>
                <div className={styles.documentHeader}>
                  <span>UNITED STATES TAX COURT</span>
                  <span className={styles.documentLink}>www.ustaxcourt.gov</span>
                </div>

                <div className={styles.documentBody}>
                  <div className={styles.petitionerRow}>
                    <span>Petitioner(s)</span>
                    <span className={styles.docketLabel}>Docket No.</span>
                  </div>
                  <div className={styles.vsRow}>
                    <span>v.</span>
                  </div>
                  <div className={styles.commissionerRow}>
                    <span>COMMISSIONER OF INTERNAL REVENUE,</span>
                  </div>
                  <div className={styles.respondentRow}>
                    <span>Respondent</span>
                  </div>

                  <div className={styles.formTitle}>
                    <h3>STATEMENT OF TAXPAYER IDENTIFICATION NUMBER</h3>
                    <p>(For, Social Security Number(s), employer identification number(s))</p>
                  </div>

                  <div className={styles.formFields}>
                    <div className={styles.formField}>
                      <label>Name of Petitioner</label>
                      <div className={styles.highlightedValue}>John A. Smith</div>
                    </div>
                    <div className={styles.formField}>
                      <label>Petitioner's Taxpayer Identification Number</label>
                      <div className={styles.highlightedValue}>123-45-6789</div>
                    </div>
                    <div className={styles.formField}>
                      <label>Name of Additional Petitioner</label>
                      <div className={styles.highlightedValue}>Mary B. Smith</div>
                    </div>
                    <div className={styles.formField}>
                      <label>Additional Petitioner's Taxpayer Identification Number</label>
                      <div className={styles.highlightedValue}>987-65-4321</div>
                    </div>
                  </div>

                  <div className={styles.formNote}>
                    If either petitioner is seeking relief from joint and several liability on a joint return
                    pursuant to Section 6015, I.R.C. 1986, and Rules 320 through 325, name of the other individual
                    with whom petitioner filed a joint return.
                  </div>

                  <div className={styles.formSignatures}>
                    <div className={styles.signatureLine}>
                      <span>SIGNATURE OF PETITIONER OR COUNSEL</span>
                      <span>DATE</span>
                    </div>
                    <div className={styles.signatureLine}>
                      <span>SIGNATURE OF ADDITIONAL PETITIONER</span>
                      <span>DATE</span>
                    </div>
                  </div>
                </div>

                <div className={styles.documentFooter}>
                  T.C. FORM 4 (01/08)
                </div>
              </div>
            </div>

            <div className={styles.previewFooter}>
              <div className={styles.previewMeta}>
                <FileText size={16} />
                <span>T.C. FORM 4 (01/08)</span>
              </div>
              <span>Page 1 of 1</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
