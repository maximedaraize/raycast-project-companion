/**
 * Project
 * 1. Create Shortcut to open repo, website, roadmap 🔴
 * 2. Add validation (Required fields for Title, url) ✅
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
  roadmap?: string;
  design?: string;
}

const projectStatus = [
  { title: 'Backlog', source: Icon.Circle, tintColor: Color.PrimaryText }, 
  { title: 'In Progress',  source: Icon.CircleProgress25, tintColor: Color.Yellow }, 
  { title: 'Paused',  source: Icon.CircleProgress50, tintColor: Color.Orange }, 
  { title: 'In Review', source: Icon.CircleProgress75, tintColor: Color.Blue },
  { title: 'Completed', source: Icon.CircleProgress100, tintColor: Color.Green },
  { title: 'Blocked',  source: Icon.Stop, tintColor: Color.Red }, 
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
          keywords={todo.status ? [todo.title, todo.status] : [todo.title]}
          detail={
            <List.Item.Detail
              markdown={todo.description}
              metadata={
                <List.Item.Detail.Metadata>
                  <List.Item.Detail.Metadata.TagList title="Status">
                    <List.Item.Detail.Metadata.TagList.Item
                      text={todo.status}
                      color={getStatusIcon(todo.status ?? "").tintColor}
                    />
                  </List.Item.Detail.Metadata.TagList>
                  <List.Item.Detail.Metadata.Separator />
                  {todo.website ? 
                    <List.Item.Detail.Metadata.Link
                      title="Website"
                      target={todo.website}
                      text={
                        todo.website.length > 32
                        ? todo.website.substring(0, 32) + '...'
                        : todo.website
                      }
                    />
                    : null
                  }
                  
                  {todo.repo ? 
                    <List.Item.Detail.Metadata.Link
                      title="Repository"
                      target={todo.repo || ""}
                      text={
                        todo.repo.length > 32
                        ? todo.repo.substring(0, 32) + '...'
                        : todo.repo
                      }
                    />
                    : null
                  }
                  
                  {todo.roadmap ? 
                    <List.Item.Detail.Metadata.Link
                      title="Roadmap"
                      target={todo.roadmap || ""}
                      text={
                        todo.roadmap.length > 32
                        ? todo.roadmap.substring(0, 32) + '...'
                        : todo.roadmap
                      }
                    />
                    : null
                  }
                  {todo.design ? 
                  <List.Item.Detail.Metadata.Link
                    title="Design Files"
                    target={todo.design || ""}
                    text={
                        todo.design.length > 32
                        ? todo.design.substring(0, 32) + '...'
                        : todo.design
                      }
                  />
                    : null
                  }
                </List.Item.Detail.Metadata>
              }
            />
          }
          actions={
            <ActionPanel>
                { todo.url ?  
                <ActionPanel.Section>
                  <Action.OpenInBrowser
                    url={`${todo.url}/`}
                    title="Open Shopify Admin in Browser"
                  />  
                  </ActionPanel.Section>
                : null }
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
    roadmap: string,
    design: string,
  }) {
    props.onCreate({ 
      title: values.title, 
      status: values.status, 
      url: values.url, 
      description: values.description, 
      website: values.website, 
      repo: values.repo, 
      roadmap: values.roadmap, 
      design: values.design, 
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
      <Form.TextField id="url" title="Shopify Partner Portal" placeholder="https://admin.shopify.com/store/..." />
      <Form.TextArea id="description" title="Project Description" placeholder="project description (Markdown enabled)" />
      <Form.Dropdown id="status" title="Status" defaultValue={projectStatus[0].title}>
        {projectStatus.map((status, index) => (
          <Form.Dropdown.Item
            key={index}
            icon={{ source: status.source, tintColor: status.tintColor }} 
            title={status.title} value={status.title}
          />
        ))}
        </Form.Dropdown>
      <Form.Separator />
      <Form.TextField id="website" title="Website" placeholder="Live website url"/>
      <Form.TextField id="repo" title="Repo" placeholder="Github, Gitlab, Bitbucket..."/>
      <Form.TextField id="roadmap" title="Roadmap" placeholder="Jira, Linear, Notion, Monday..."/>
      <Form.TextField id="desgin" title="Design" placeholder="Figma, Sketch..."/>
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
    roadmap: string, 
    design: string
  }) {
    props.onEdit(props.index, { 
      title: values.title, 
      status: values.status, 
      url: values.url, 
      description: values.description, 
      website: values.website, 
      repo: values.repo, 
      roadmap: values.roadmap, 
      design: values.design
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
      <Form.TextField id="title" title="Title" placeholder="project name" defaultValue={props.todo.title} />
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
      <Form.TextField id="url" title="Shopify Partner Portal" placeholder="https://admin.shopify.com/store/" defaultValue={props.todo.url} />
      <Form.TextArea id="description" title="Project Description" placeholder="project description (Markdown enabled)" defaultValue={props.todo.description}/>
      <Form.Separator />
      <Form.TextField id="website" title="Website" placeholder="official website" defaultValue={props.todo.website}/>
      <Form.TextField id="repo" title="Repo" placeholder="repo, gitlab, bitbucket..." defaultValue={props.todo.repo}/>
      <Form.TextField id="roadmap" title="Roadmap" placeholder="jira, linear, notion, airtable..." defaultValue={props.todo.roadmap}/>
      <Form.TextField id="design" title="Design" placeholder="jira, linear, notion, airtable..." defaultValue={props.todo.design}/>
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
