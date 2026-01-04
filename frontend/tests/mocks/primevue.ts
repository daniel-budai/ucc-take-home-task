/**
 * Shared PrimeVue component mocks for testing
 * These mocks provide basic functionality for v-model and event handling
 */

export const createPrimeVueMocks = () => ({
  InputText: {
    name: 'InputText',
    template: '<input data-testid="input-text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :disabled="disabled" v-bind="$attrs" />',
    props: ['modelValue', 'invalid', 'disabled', 'placeholder', 'maxlength'],
  },
  Textarea: {
    name: 'Textarea',
    template: '<textarea data-testid="textarea" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" v-bind="$attrs"></textarea>',
    props: ['modelValue', 'rows', 'placeholder'],
  },
  DatePicker: {
    name: 'DatePicker',
    template: '<input data-testid="date-picker" type="datetime-local" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" v-bind="$attrs" />',
    props: ['modelValue', 'invalid', 'disabled', 'showTime', 'hourFormat', 'placeholder'],
  },
  Button: {
    name: 'Button',
    template: '<button data-testid="button" v-bind="$attrs" :aria-label="ariaLabel" @click="$emit(\'click\', $event)" :disabled="disabled"><slot>{{ label }}</slot></button>',
    props: ['type', 'label', 'loading', 'severity', 'outlined', 'icon', 'disabled', 'ariaLabel', 'aria-label'],
  },
  Avatar: {
    name: 'Avatar',
    template: '<div data-testid="avatar" class="avatar" v-bind="$attrs"><slot /></div>',
    props: ['label', 'image', 'icon', 'shape', 'size'],
  },
  DataTable: {
    name: 'DataTable',
    template: '<div data-testid="data-table" class="datatable" v-bind="$attrs"><slot /></div>',
    props: ['value', 'rows', 'paginator', 'sortField', 'sortOrder'],
  },
  Column: {
    name: 'Column',
    template: '<div data-testid="column"><slot /></div>',
    props: ['field', 'header', 'sortable'],
  },
  Menu: {
    name: 'Menu',
    template: `
      <nav data-testid="menu" class="menu" v-bind="$attrs">
        <ul>
          <li v-for="item in model" :key="item.label">{{ item.label }}</li>
        </ul>
        <slot />
      </nav>
    `,
    props: ['model', 'popup'],
  },
})

/**
 * Get PrimeVue component stubs for use in Vue Test Utils
 */
export const getPrimeVueStubs = () => createPrimeVueMocks()

