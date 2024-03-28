/**
 * Todo
 * 1. Create Shortcut to open github, website, kanban
 * 2. Add validation (Required fields for Title, url)
 * 3. Add local storage to save the todos
 * 4. Add a way to edit the todo ✅
 * 5. Add List.EmptyView State
 */

import { Action, ActionPanel, Form, Icon, List, useNavigation, Color} from "@raycast/api";
import { useState } from "react";

interface Todo {
  title: string;
  url?: string;
  description?: string;
  status?: string;
  website?: string;
  github?: string;
  kanban?: string;
}

export default function Command() {
  
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleCreate(todo: Todo) {
    const newTodos = [...todos, todo];
    setTodos(newTodos);
  }

  function handleDelete(index: number) {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  }

  function handleEdit(index: number, editedTodo: Todo) {
    const updatedTodos = [...todos];
    updatedTodos[index] = editedTodo;
    setTodos(updatedTodos);
  }

  return (
    <List isShowingDetail
      actions={
        <ActionPanel>
          <CreateTodoAction onCreate={handleCreate} />
        </ActionPanel>
      }
    >
      {todos.map((todo, index) => (
        <List.Item
          key={index}
          icon={Icon.Circle}
          title={todo.title}
          subtitle={todo.url}
          detail={
            <List.Item.Detail
              markdown={todo.description}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.TagList title="Status">
                    <List.Item.Detail.Metadata.TagList.Item text={todo.status} color={
                      todo.status === "Not Started"
                        ? Color.Red
                        : todo.status === "Ongoing"
                        ? Color.Yellow
                        : todo.status === "Completed"
                        ? Color.Green
                        : todo.status === "Maintenance"
                        ? Color.Blue
                        : null
                    } />
                  </List.Item.Detail.Metadata.TagList>
                  <List.Item.Detail.Metadata.Separator />
                  <List.Item.Detail.Metadata.Label title="Shopify Website" icon="pokemon_types/poison.svg" text="Poison" />
                  <List.Item.Detail.Metadata.Label title="Github" icon="pokemon_types/poison.svg" text="Poison" />
                  <List.Item.Detail.Metadata.Link
                    title="kanban"
                    target={todo.kanban || ""}
                    text={todo.kanban || "No kanban link"}
                  />
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action.OpenInBrowser url={`https://admin.shopify.com/store/${todo.url}/`} title="Open in Browser" />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <EditTodoAction onEdit={handleEdit} todo={todo} index={index} />
                <DeleteTodoAction onDelete={() => handleDelete(index)} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function CreateTodoForm(props: { onCreate: (todo: Todo) => void }) {
  const { pop } = useNavigation();

  function handleSubmit(values: { 
    title: string, 
    status: string, 
    url: string,
    description: string, 
    website: string, 
    github: string, 
    kanban: string, 
  }) {
    props.onCreate({ 
      title: values.title, 
      status: values.status, 
      url: values.url, 
      description: values.description, 
      website: values.website, 
      github: values.github, 
      kanban: values.kanban, 
    });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Todo" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title"/>
      <Form.TextField id="url" title="Admin Portal" placeholder="https://admin.shopify.com/store/..." value="https://admin.shopify.com/store/" />
      <Form.Dropdown id="status" title="Status"
      defaultValue="Not Started">
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Red }} title="Not Started" value="Not Started" />
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Yellow }} title="Ongoing" value="Ongoing" />
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Green }} title="Completed" value="Completed" />
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Blue }} title="Maintenace" value="Maintenace" />
        </Form.Dropdown>
      <Form.TextArea id="description" title="Project Description" />
      <Form.Separator />
      <Form.TextField id="website" title="Shopify Website" />
      <Form.TextField id="github" title="Github" />
      <Form.TextField id="kanban" title="Kanban" />
    </Form>
  );
}

function CreateTodoAction(props: { onCreate: (todo: Todo) => void }) {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Create Todo"
      shortcut={{ modifiers: ["cmd"], key: "n" }}
      target={<CreateTodoForm onCreate={props.onCreate} />}
    />
  );
}

function DeleteTodoAction(props: { onDelete: () => void }) {
  return (
    <Action
      icon={Icon.Trash}
      title="Delete Todo"
      shortcut={{ modifiers: ["ctrl"], key: "x" }}
      onAction={props.onDelete}
    />
  );
}

function EditTodoForm(props: { 
  onEdit: (index: number, todo: Todo) => void,
  todo: Todo,
  index: number,
}) {
  const { pop } = useNavigation();

  function handleSubmit(values: { 
    title: string, 
    status: string, 
    url: string,
    description: string, 
    website: string, 
    github: string, 
    kanban: string, 
  }) {
    props.onEdit(props.index, { 
      title: values.title, 
      status: values.status, 
      url: values.url, 
      description: values.description, 
      website: values.website, 
      github: values.github, 
      kanban: values.kanban, 
    });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Edit Todo" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" defaultValue={props.todo.title}/>
      <Form.TextField id="url" title="Admin Portal" defaultValue={`https://admin.shopify.com/store/${props.todo.url}`} />
      <Form.Dropdown 
        id="status" 
        title="Status" 
        defaultValue={props.todo.status}
        storeValue
      >
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Red }} title="Not Started" value="Not Started" />
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Yellow }} title="Ongoing" value="Ongoing" />
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Green }} title="Completed" value="Completed" />
        <Form.Dropdown.Item icon={{ source: Icon.Circle, tintColor: Color.Blue }} title="Maintenance" value="Maintenance" />
      </Form.Dropdown>
      <Form.TextArea id="description" title="Project Description" defaultValue={props.todo.description}/>
      <Form.Separator />
      <Form.TextField id="website" title="Shopify Website" defaultValue={props.todo.website}/>
      <Form.TextField id="github" title="Github" defaultValue={props.todo.github}/>
      <Form.TextField id="kanban" title="Kanban" defaultValue={props.todo.kanban}/>
    </Form>
  );
}

function EditTodoAction(props: { 
  onEdit: (index: number, todo: Todo) => void, 
  todo: Todo, 
  index: number 
}) {
  return (
    <Action.Push
      icon={Icon.Pill}
      title="Edit Todo"
      shortcut={{ modifiers: ["ctrl"], key: "e" }}
      target={<EditTodoForm onEdit={props.onEdit} todo={props.todo} index={props.index}/>}
    />
  );
}
