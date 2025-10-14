'use client';
import { Formik, Form, Field, ErrorMessage as FormikError } from 'formik';
import * as Yup from 'yup';
import css from './NoteForm.module.css';
import { createNote } from '@/lib/api';
import type { NoteTag } from '@/types/note';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';

export interface NoteFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

const tags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'] as const;

const schema = Yup.object({
  title: Yup.string().min(3, 'Min 3').max(50, 'Max 50').required('Required'),
  content: Yup.string().max(500, 'Max 500'),
  tag: Yup.mixed<NoteTag>().oneOf(tags, 'Invalid').required('Required'),
});

export default function NoteForm({ onCreated, onCancel }: NoteFormProps) {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: createNote,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created');
      onCreated();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'Failed to create note'));
    },
  });

  return (
    <Formik
      initialValues={{ title: '', content: '', tag: 'Todo' as NoteTag }}
      validationSchema={schema}
      onSubmit={(values, helpers) => {
        create.mutate(values, {
          onSettled: () => helpers.setSubmitting(false),
        });
      }}
    >
      {({ isSubmitting }) => (
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" name="title" type="text" className={css.input} />
            <FormikError name="title" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field as="textarea" id="content" name="content" rows={8} className={css.textarea} />
            <FormikError name="content" component="span" className={css.error} />
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field as="select" id="tag" name="tag" className={css.select}>
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Field>
            <FormikError name="tag" component="span" className={css.error} />
          </div>

          <div className={css.actions}>
            <button type="button" className={css.cancelButton} onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className={css.submitButton} disabled={isSubmitting || create.isPending}>
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
