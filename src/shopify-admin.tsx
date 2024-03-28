/**
 * Project
 * 1. Create Shortcut to open repo, website, kanban
 * 2. Add validation (Required fields for Title, url)
 * 3. Add local storage to save the projects ✅
 * 4. Add a way to edit the todo ✅
 * 5. Add List.EmptyView State
 */

import { Action, ActionPanel, Form, Icon, List, useNavigation, Color, LocalStorage } from "@raycast/api";
import { useState, useEffect } from "react";

interface Project {
  title: string;
  url?: string;
  description?: string;
  status?: string;
  website?: string;
  repo?: string;
  kanban?: string;
}

const projectStatus = [
  { title: 'Not Started', source: Icon.Circle, tintColor: Color.Red }, 
  { title: 'In Progress',  source: Icon.CircleProgress25, tintColor: Color.Yellow }, 
  { title: 'Maintenance', source: Icon.CircleProgress75, tintColor: Color.Blue },
  { title: 'Completed', source: Icon.CircleProgress100, tintColor: Color.Green },
];

export default function Command() {
  
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchStoredTodos = async () => {
      const storedTodos = await LocalStorage.getItem<string>("projects");
      if (storedTodos) {
        setProjects(JSON.parse(storedTodos));
      }
    };

    fetchStoredTodos();
  }, []);

  useEffect(() => {
    LocalStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  function handleCreate(todo: Project) {
    const newTodos = [...projects, todo];
    setProjects(newTodos);
  }

  function handleDelete(index: number) {
    const newTodos = [...projects];
    newTodos.splice(index, 1);
    setProjects(newTodos);
  }

  function handleEdit(index: number, editedTodo: Project) {
    const updatedTodos = [...projects];
    updatedTodos[index] = editedTodo;
    setProjects(updatedTodos);
  }

  const getStatusIcon = (status: string): { source: Icon; tintColor?: Color } => {
    const statusIcons: { [key: string]: { source: Icon; tintColor?: Color } } = {
      ...projectStatus.reduce((icons, { title, source, tintColor }) => {
        icons[title] = { source, tintColor };
        return icons;
      }, {} as { [key: string]: { source: Icon; tintColor?: Color } }), // Add index signature
    };
    
    return statusIcons[status] || { source: Icon.Circle };
  };


  return (
    <List
      isShowingDetail
      searchBarPlaceholder="Search Projects by Name or Status"
      filtering={{ keepSectionOrder: true }}
      throttle
      actions={
        <ActionPanel>
          <CreateTodoAction onCreate={handleCreate} />
        </ActionPanel>
      }
    >
      {projects.map((todo, index) => (
        <List.Item
          key={index}
          icon={getStatusIcon(todo.status ?? "")}
          title={todo.title}
          subtitle={todo.url}
          keywords={todo.status ? [todo.title, todo.status] : [todo.title]}
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
                  <List.Item.Detail.Metadata.Label title="Repo" icon="pokemon_types/poison.svg" text="Poison" />
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
                <Action.OpenInBrowser
                  url={`https://admin.shopify.com/store/${todo.url}/`}
                  title="Open Shopify Admin in Browser"
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                <CreateTodoAction onCreate={handleCreate} />
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

function CreateTodoForm(props: { onCreate: (todo: Project) => void }) {
  const { pop } = useNavigation();

  function handleSubmit(values: { 
    title: string, 
    status: string, 
    url: string,
    description: string, 
    website: string, 
    repo: string, 
    kanban: string, 
  }) {
    props.onCreate({ 
      title: values.title, 
      status: values.status, 
      url: values.url, 
      description: values.description, 
      website: values.website, 
      repo: values.repo, 
      kanban: values.kanban, 
    });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Project" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" placeholder="project name"/>
      <Form.TextField id="url" title="Admin Portal" placeholder="https://admin.shopify.com/store/..." />
      <Form.Dropdown id="status" title="Status" defaultValue={projectStatus[0].title}>
        {projectStatus.map((status, index) => (
          <Form.Dropdown.Item
            key={index}
            icon={{ source: status.source, tintColor: status.tintColor }} 
            title={status.title} value={status.title}
          />
        ))}
        </Form.Dropdown>
      <Form.TextArea id="description" title="Project Description" placeholder="project description (Markdown enabled)"/>
      <Form.Separator />
      <Form.TextField id="website" title="Shopify Website" placeholder="official website"/>
      <Form.TextField id="repo" title="Repo" placeholder="repo, gitlab, bitbucket..."/>
      <Form.TextField id="kanban" title="Kanban" placeholder="jira, linear, notion, airtable"/>
    </Form>
  );
}

function CreateTodoAction(props: { onCreate: (todo: Project) => void }) {
  return (
    <Action.Push
      icon={Icon.Document}
      title="Create Project"
      shortcut={{ modifiers: ["cmd", "opt"], key: "n" }}
      target={<CreateTodoForm onCreate={props.onCreate} />}
    />
  );
}

function DeleteTodoAction(props: { onDelete: () => void }) {
  return (
    <Action
      icon={Icon.Trash}
      title="Delete Project"
      shortcut={{ modifiers: ["cmd", "opt"], key: "x" }}
      onAction={props.onDelete}
    />
  );
}

function EditTodoForm(props: { 
  onEdit: (index: number, todo: Project) => void,
  todo: Project,
  index: number,
}) {
  const { pop } = useNavigation();

  function handleSubmit(values: { 
    title: string, 
    status: string, 
    url: string,
    description: string, 
    website: string, 
    repo: string, 
    kanban: string, 
  }) {
    props.onEdit(props.index, { 
      title: values.title, 
      status: values.status, 
      url: values.url, 
      description: values.description, 
      website: values.website, 
      repo: values.repo, 
      kanban: values.kanban, 
    });
    pop();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Edit Project" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="title" title="Title" placeholder="project name" defaultValue={props.todo.title}/>
      <Form.TextField id="url" title="Admin Portal" placeholder="https://admin.shopify.com/store/" defaultValue={props.todo.url} />
      <Form.Dropdown 
        id="status" 
        title="Status" 
        defaultValue={props.todo.status}
        storeValue
      >
        {projectStatus.map((status, index) => (
          <Form.Dropdown.Item
            key={index}
            icon={{ source: status.source, tintColor: status.tintColor }} 
            title={status.title} value={status.title}
          />
        ))}
      </Form.Dropdown>
      <Form.TextArea id="description" title="Project Description" placeholder="project description (Markdown enabled)" defaultValue={props.todo.description}/>
      <Form.Separator />
      <Form.TextField id="website" title="Shopify Website" placeholder="official website" defaultValue={props.todo.website}/>
      <Form.TextField id="repo" title="Repo" placeholder="repo, gitlab, bitbucket..." defaultValue={props.todo.repo}/>
      <Form.TextField id="kanban" title="Kanban" placeholder="jira, linear, notion, airtable..." defaultValue={props.todo.kanban}/>
    </Form>
  );
}

function EditTodoAction(props: { 
  onEdit: (index: number, todo: Project) => void, 
  todo: Project, 
  index: number 
}) {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Edit Project"
      shortcut={{ modifiers: ["cmd", "opt"], key: "e" }}
      target={<EditTodoForm onEdit={props.onEdit} todo={props.todo} index={props.index}/>}
    />
  );
}
