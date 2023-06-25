<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Row } from '@/types/row'

export default defineComponent({
  name: 'OverviewTable',
  props: {
    rows: { type: Object as PropType<Row[]>, required: true }
  },
  computed: {
    formattedCsv(): string {
      if (this.rows.length === 0) {
        return ''
      }

      const data = this.rows.filter((row) => row.active).flatMap(this.mapRow)
      console.log(data)
      data.unshift(['Bilag nr.', 'Dato', 'Tekst', 'Konto', 'Beløb', 'Modkonto'])

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.$papa.unparse(data, { delimiter: ';' }).trim()
    }
  },
  methods: {
    mapRow(input: Row): string[][] {
      if (input.charged === 0) {
        return [[]]
      }

      if (input.fee) {
        return this.mapIncludingFee(input)
      }

      if (input.transferred > 0) {
        return [
          [
            '',
            input.date.toISOString(),
            'Overførsel fra ReePay til Bank',
            '55080',
            (-input.transferred).toString().replace('.', ','),
            '55000'
          ]
        ]
      } else {
        return [
          [
            '',
            input.date.toISOString(),
            'Overførsel fra Bank til ReePay',
            '55000',
            input.transferred.toString().replace('.', ','),
            '55080'
          ]
        ]
      }
    },
    mapIncludingFee(input: Row): string[][] {
      const id = input.id.toString()
      return [
        [
          id,
          input.date.toISOString(),
          'Reepay - Trukket',
          '55080',
          (-input.charged).toString().replace('.', ','),
          ''
        ],
        [
          id,
          input.date.toISOString(),
          'Reepay - Gebyr',
          '7220',
          input.fee.toString().replace('.', ','),
          ''
        ],
        [
          id,
          input.date.toISOString(),
          'Reepay - Udbetalt',
          '55000',
          input.transferred.toString().replace('.', ','),
          ''
        ]
      ]
    },
    download(csv: string): Promise<void> {
      if (!csv) {
        return
      }

      const fileName = this.generateFileName()
      const objectUrl = this.generateObjectURL(csv)

      // Create and activate link element
      const el = document.createElement('a')
      el.download = fileName
      el.href = objectUrl
      el.click()

      // Clean up
      el.remove()
      window.URL.revokeObjectURL(objectUrl)
    },
    generateFileName(): string {
      return 'formatted.csv'
    },
    generateObjectURL(data: string): string {
      return window.URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8;' }))
    }
  }
})
</script>

<template>
  <div v-if="rows.length !== 0">
    <span @click="download(formattedCsv)" class="btn btn-primary">Download</span>
    <br />
    <br />
    <pre>{{ formattedCsv }}</pre>
  </div>
</template>

<style scoped></style>
