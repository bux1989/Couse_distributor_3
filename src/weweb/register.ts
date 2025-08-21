// …existing imports

// Inside your registration object:
window.addWwComponent({
  // …
  edition: [
    {
      // Section: Specific
      id: 'custom',
      label: { en: 'Specific', fr: 'Spécifique' },
      icon: 'dots-horizontal',
      // Fields in this section:
      fields: [
        // Items repeat field: MUST include properties
        {
          label: { en: 'Items', fr: 'Items' },
          type: 'Repeat',            // sometimes 'Array' depending on your schema
          path: 'content.children',  // this matches the path in the warning
          bindable: true,
          defaultValue: [],
          properties: [
            {
              label: { en: 'Title', fr: 'Titre' },
              type: 'Text',
              key: 'title',
              bindable: true,
              defaultValue: '',
            },
            {
              label: { en: 'Description', fr: 'Description' },
              type: 'LongText', // or 'Textarea' depending on your setup
              key: 'description',
              bindable: true,
              defaultValue: '',
            },
            {
              label: { en: 'Note', fr: 'Note' },
              type: 'LongText',
              key: 'note',
              bindable: true,
              defaultValue: '',
            },
            // add any other per-item props your component expects
          ],
        },
      ],
    },
  ],
  // …
})
