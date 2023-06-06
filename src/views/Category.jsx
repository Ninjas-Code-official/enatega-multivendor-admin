/* eslint-disable react/display-name */
import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import CategoryComponent from '../components/Category/Category'
import CustomLoader from '../components/Loader/CustomLoader'
// core components
import Header from '../components/Headers/Header'
import { getRestaurantDetail, deleteCategory } from '../apollo'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import SearchBar from '../components/TableHeader/SearchBar'
import useGlobalStyles from '../utils/globalStyles'
import {
  Container,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Typography,
  ListItemIcon,
  Grid
} from '@mui/material'
import { customStyles } from '../utils/tableCustomStyles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import TableHeader from '../components/TableHeader'
import Alert from '../components/Alert'

const GET_CATEGORIES = gql`
  ${getRestaurantDetail}
`
const DELETE_CATEGORY = gql`
  ${deleteCategory}
`
const Category = props => {
  const [editModal, setEditModal] = useState(false)
  const [category, setCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = category => {
    setEditModal(!editModal)
    setCategory(category)
  }
  const restaurantId = localStorage.getItem('restaurantId')

  const [/*mutate*/ { loading }] = useMutation(DELETE_CATEGORY)

  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_CATEGORIES,
    {
      variables: {
        id: restaurantId
      }
    }
  )
  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (row[field]) {
        return row[field].toLowerCase()
      }
      return row[field]
    }
    return orderBy(rows, handleField, direction)
  }
  const columns = [
    {
      name: 'Title',
      sortable: true,
      selector: 'title'
    },
    {
      name: 'Action',
      cell: row => <>{actionButtons(row)}</>
    }
  ]
  const actionButtons = row => {
    const [anchorEl, setAnchorEl] = React.useState(null)
    const open = Boolean(anchorEl)
    const handleClick = event => {
      setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
      setAnchorEl(null)
    }
    return (
      <>
        <div>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-haspopup="true"
            onClick={handleClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Paper>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button'
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}>
              <MenuItem
                onClick={e => {
                  e.preventDefault()
                  setIsOpen(true)
                  setTimeout(() => {
                    setIsOpen(false)
                  }, 5000)
                  //uncomment this for paid version
                  //toggleModal(row)
                }}
                style={{ height: 25 }}>
                <ListItemIcon>
                  <EditIcon fontSize="small" style={{ color: 'green' }} />
                </ListItemIcon>
                <Typography color="green">Edit</Typography>
              </MenuItem>
              <MenuItem
                onClick={e => {
                  e.preventDefault()
                  setIsOpen(true)
                  setTimeout(() => {
                    setIsOpen(false)
                  }, 5000)
                  //uncomment this for paid version
                  // mutate({
                  //   variables: { id: row._id, restaurant: restaurantId }
                  // })
                }}
                style={{ height: 25 }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" style={{ color: 'red' }} />
                </ListItemIcon>
                <Typography color="red">Delete</Typography>
              </MenuItem>
            </Menu>
          </Paper>
        </div>
      </>
    )
  }

  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? data && data.restaurant.categories
      : data &&
        data.restaurant.categories.filter(category => {
          return category.title.toLowerCase().search(regex) > -1
        })
  const globalClasses = useGlobalStyles()
  return (
    <>
      <Header />
      {isOpen && (
            <Alert
              message="This feature will available after purchasing product"
              severity="warning"
              />
          )}
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <Grid container mb={3}>
          <Grid item xs={12} md={7}>
            <CategoryComponent />
          </Grid>
        </Grid>
        {errorQuery ? <span>{`Error! ${errorQuery.message}`}</span> : null}
        {loadingQuery ? (
          <CustomLoader />
        ) : (
          <DataTable
            subHeader={true}
            subHeaderComponent={
              <SearchBar
                value={searchQuery}
                onChange={onChangeSearch}
                onClick={() => refetch()}
              />
            }
            title={<TableHeader title="Categories" />}
            columns={columns}
            data={filtered}
            pagination
            progressPending={loading}
            progressComponent={<CustomLoader />}
            sortFunction={customSort}
            defaultSortField="title"
            customStyles={customStyles}
            selectableRows
            paginationIconLastPage=""
            paginationIconFirstPage=""
          />
        )}

        <Modal
          open={editModal}
          onClose={() => {
            toggleModal(null)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <CategoryComponent category={category} />
        </Modal>
      </Container>
    </>
  )
}
export default withTranslation()(Category)
