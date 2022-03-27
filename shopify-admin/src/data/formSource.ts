
export interface inputType{
  id : number,
  name: string,
  label: String,
  type: string,
  placeholder?: string
}

export const userInputs : inputType[] = [
    {
      id: 1,
      name: 'name',
      label: "name",
      type: "text",
      placeholder: "user name",
    },

    {
      id: 2,
      name: 'email',
      label: "Email",
      type: "email",
      placeholder: "user email",
    },
    {
      id: 3,
      name: 'password',
      label: "Password",
      type: "password",
    },
    {
      id: 4,
      name: 'passwordConfirm',
      label: "Confirm Password",
      type: "password",
    },
    {
      id: 5,
      name: 'phone',
      label: "Phone",
      type: "text",
      placeholder: "user phone",
    },
    {
      id: 6,
      name: 'address',
      label: "Address",
      type: "text",
      placeholder: "Elton St. 216 NewYork",
    }
  ];
  

  export const productInputs = [
    {
      id: 1,
      name: 'title',
      label: "Title",
      type: "text",
      placeholder: "Apple Macbook Pro",
    },
    {
      id: 2,
      name: 'desc',
      label: "Description",
      type: "text",
      placeholder: "Description",
    },
    {
      id: 3,
      name: 'categories',
      label: "Category",
      type: "text",
      placeholder: "Computers",
    },
    {
      id: 4,
      name: 'size',
      label: "Size",
      type: "text",
      placeholder: "100",
    },
    {
      id: 5,
      name: 'color',
      label: "Color",
      type: "text",
      placeholder: "100",
    },
    {
      id: 6,
      name: 'price',
      label: "Price",
      type: "text",
      placeholder: "100",
    },
    {
      id: 7,
      name: 'inStock',
      label: "Stock",
      type: "text",
      placeholder: "in stock",
    },
  ];
  